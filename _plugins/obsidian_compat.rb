# frozen_string_literal: true

require "cgi"
require "pathname"
require "uri"

# Compatibility layer for a real Obsidian vault.  It keeps the Markdown source
# close to its original form while turning wiki links, embeds and callouts into
# ordinary web content during the Jekyll build.
module Jekyll
  module ObsidianCompat
    WIKI_EMBED_PATTERN = /!\[\[([^\]]+)\]\]/.freeze
    WIKI_LINK_PATTERN = /(?<!!)\[\[([^\]]+)\]\]/.freeze
    IMAGE_SRC_PATTERN = %r{(<img\b[^>]*\bsrc=(["']))([^"']+)(\2)}i.freeze
    CALLOUT_START_PATTERN = /\A>\s*\[!([\w-]+)\][+-]?\s*(.*?)\s*\z/i.freeze
    BLOCKQUOTE_LINE_PATTERN = /\A>\s?(.*)\z/.freeze
    ASSET_SOURCE_ROOT = "MyMind".freeze
    ASSET_URL_ROOT = "assets/obsidian".freeze
    IMAGE_EXTENSIONS = %w(.apng .avif .gif .jpg .jpeg .png .svg .webp).freeze

    module_function

    def source_path_for(doc)
      doc.data.fetch("source_path", "").to_s.sub(%r{\A/+}, "")
    end

    def source_stem_for(doc)
      source_path_for(doc).sub(/\.(?:md|markdown|mkd|mkdn|mdown)\z/i, "")
    end

    def aliases_for(doc)
      aliases = Array(doc.data["aliases"]).map(&:to_s)
      [doc.data["title"].to_s, File.basename(source_stem_for(doc)), *aliases].map(&:strip).reject(&:empty?)
    end

    def note_index(site)
      return site.config["obsidian_note_index"] if site.config.key?("obsidian_note_index")

      index = Hash.new { |hash, key| hash[key] = [] }
      site.posts.docs.each do |doc|
        keys = [source_stem_for(doc), source_path_for(doc)] + aliases_for(doc)
        keys.each do |key|
          normalized = normalize_note_key(key)
          index[normalized] << doc unless normalized.empty?
        end
      end
      site.config["obsidian_note_index"] = index
    end

    def normalize_note_key(value)
      value.to_s.strip.tr("\\", "/").sub(%r{\A\./}, "").sub(/\.(?:md|markdown|mkd|mkdn|mdown)\z/i, "").downcase
    end

    def split_target(value)
      target, label = value.to_s.split("|", 2)
      target = target.to_s.strip
      target, anchor = target.split("#", 2)
      [target.strip, label&.strip, anchor&.strip]
    end

    def post_for(site, target)
      index = note_index(site)
      key = normalize_note_key(target)
      exact = index[key]
      return exact.first if exact && exact.length == 1

      basename = File.basename(key)
      matches = index[basename]
      matches&.first
    end

    def category_for(site, target)
      categories = site.config.dig("obsidian_jekyll", "categories") || []
      categories.find { |item| item["name"].to_s.casecmp?(target.to_s) }
    end

    def url_with_base(site, path)
      base = site.baseurl.to_s.sub(%r{/$}, "")
      path = "/#{path}" unless path.start_with?("/")
      "#{base}#{path}"
    end

    def escaped_url(url)
      # Jekyll already percent-encodes post URLs.  Normalize first so wiki
      # links do not turn a valid `%E4...` path into `%25E4...`.
      URI::DEFAULT_PARSER.escape(URI::DEFAULT_PARSER.unescape(url.to_s))
    rescue URI::InvalidURIError
      url.to_s.gsub(" ", "%20")
    end

    def anchor_for(heading)
      return "" if heading.to_s.empty?

      "##{heading.to_s.downcase.gsub(/[^\p{L}\p{N}\s-]/, "").strip.gsub(/\s+/, "-")}"
    end

    def resolve_wiki_link(doc, raw)
      target, label, anchor = split_target(raw)
      display = label.to_s.empty? ? target : label
      post = post_for(doc.site, target)
      if post
        href = escaped_url(url_with_base(doc.site, post.url) + anchor_for(anchor))
        return %(<a class="wikilink" href="#{CGI.escapeHTML(href)}">#{CGI.escapeHTML(display)}</a>)
      end

      category = category_for(doc.site, target)
      if category
        category_path = category["name"].to_s.tr("/", "-")
        href = escaped_url(url_with_base(doc.site, "/categories/#{category_path}/"))
        return %(<a class="wikilink" href="#{CGI.escapeHTML(href)}">#{CGI.escapeHTML(display)}</a>)
      end

      CGI.escapeHTML(display)
    end

    def normalized_asset_path(doc, target)
      path = CGI.unescapeHTML(target.to_s).strip.tr("\\", "/")
      path = URI::DEFAULT_PARSER.unescape(path) rescue path
      path = path.sub(%r{\A\./}, "")
      return nil if path.empty? || path.start_with?("/", "http://", "https://", "//", "#")

      candidates = if path.start_with?("_resources/")
                     [path]
                   else
                     physical_path = vault_relative_path_for(doc)
                     source_path = source_path_for(doc)
                     [
                       physical_path && File.join(File.dirname(physical_path), path),
                       !source_path.empty? && File.join(File.dirname(source_path), path),
                       path,
                     ].select { |candidate| candidate && candidate != false }.uniq
                   end

      candidates.each do |candidate|
        clean = Pathname.new(candidate).cleanpath.to_s.sub(%r{\A\./}, "")
        next if clean.start_with?("../")

        source_file = File.join(doc.site.source, ASSET_SOURCE_ROOT, clean)
        return clean if File.file?(source_file)
      end
      nil
    end

    def vault_relative_path_for(doc)
      posts_root = File.expand_path(doc.site.in_source_dir(ASSET_SOURCE_ROOT))
      document_path = File.expand_path(doc.path.to_s)
      return nil unless document_path.start_with?("#{posts_root}/")

      document_path.delete_prefix("#{posts_root}/")
    end

    def asset_url(doc, target)
      asset_path = normalized_asset_path(doc, target)
      return nil unless asset_path

      escaped_url(url_with_base(doc.site, "/#{ASSET_URL_ROOT}/#{asset_path}"))
    end

    def resolve_embed(doc, raw)
      target, label, = split_target(raw)
      href = asset_url(doc, target)
      return CGI.escapeHTML(label.to_s.empty? ? target : label) unless href

      extension = File.extname(target).downcase
      if IMAGE_EXTENSIONS.include?(extension)
        alt = label.to_s.empty? ? File.basename(target, extension) : label
        %(<img class="obsidian-embed" src="#{CGI.escapeHTML(href)}" alt="#{CGI.escapeHTML(alt)}" loading="lazy">)
      else
        name = label.to_s.empty? ? File.basename(target) : label
        %(<a class="asset-link" href="#{CGI.escapeHTML(href)}" target="_blank" rel="noopener">#{CGI.escapeHTML(name)}</a>)
      end
    end

    def transform_wiki_syntax(doc, content)
      content.to_s.gsub(WIKI_EMBED_PATTERN) { resolve_embed(doc, Regexp.last_match(1)) }
                    .gsub(WIKI_LINK_PATTERN) { resolve_wiki_link(doc, Regexp.last_match(1)) }
    end

    def expand_callouts(content)
      lines = content.to_s.lines(chomp: true)
      expanded = []
      index = 0

      while index < lines.length
        match = lines[index].match(CALLOUT_START_PATTERN)
        unless match
          expanded << lines[index]
          index += 1
          next
        end

        kind = match[1].downcase
        title = match[2].to_s.strip
        body = []
        index += 1
        while index < lines.length && (body_match = lines[index].match(BLOCKQUOTE_LINE_PATTERN))
          body << body_match[1]
          index += 1
        end

        title = kind.capitalize if title.empty?
        expanded << "> **#{title}**"
        body.each { |line| expanded << "> #{line}" }
        expanded << "{: .obsidian-callout .obsidian-callout--#{kind}}"
      end

      expanded.join("\n") + (content.to_s.end_with?("\n") ? "\n" : "")
    end

    def rewrite_markdown_image_urls(doc)
      doc.output = doc.output.gsub(IMAGE_SRC_PATTERN) do
        prefix = Regexp.last_match(1)
        source = Regexp.last_match(3)
        suffix = Regexp.last_match(4)
        href = asset_url(doc, source)
        href ? "#{prefix}#{CGI.escapeHTML(href)}#{suffix}" : Regexp.last_match(0)
      end
    end

    def reading_time_for(content)
      readable = content.to_s.gsub(/```.*?```/m, " ").gsub(/`[^`]*`/, " ")
      han_characters = readable.scan(/\p{Han}/).length
      latin_words = readable.scan(/[A-Za-z0-9][A-Za-z0-9'-]*/).length
      minutes = (han_characters / 450.0 + latin_words / 200.0).ceil
      [[minutes, 1].max, 99].min
    end

    def collect_link_graph(site)
      docs = site.posts.docs
      docs.each do |doc|
        doc.data["outlinks"] = []
        doc.data["backlinks"] = []
        doc.data["reading_time"] = reading_time_for(doc.content)
      end

      docs.each do |source|
        source.content.to_s.scan(WIKI_LINK_PATTERN) do |match|
          raw_target = match.is_a?(Array) ? match.first : match
          target_name, = split_target(raw_target)
          target = post_for(site, target_name)
          next unless target && target != source

          slug = target.data["slug"].to_s
          source.data["outlinks"] << slug unless slug.empty? || source.data["outlinks"].include?(slug)
          next if target.data["backlinks"].any? { |item| item["slug"] == source.data["slug"] }

          target.data["backlinks"] << {
            "slug" => source.data["slug"].to_s,
            "title" => source.data["title"].to_s,
            "url" => source.url,
            "category" => source.data["category"].to_s
          }
        end
      end

      site.data["obsidian_graph"] = {
        "nodes" => docs.map do |doc|
          {
            "id" => doc.data["slug"].to_s,
            "title" => doc.data["title"].to_s,
            "url" => doc.url,
            "category" => doc.data["category"].to_s,
            "links" => doc.data["outlinks"],
            # Keep tags in the graph feed as first-class metadata.  The
            # browser turns shared tags into their own graph nodes so a topic
            # can connect notes even when they do not link to one another.
            "tags" => Array(doc.data["tags"]).map { |tag| tag.to_s.strip }.reject(&:empty?).uniq
          }
        end,
        "backlinks" => docs.each_with_object({}) do |doc, memo|
          memo[doc.data["slug"].to_s] = doc.data["backlinks"]
        end,
        "reading_time" => docs.each_with_object({}) do |doc, memo|
          memo[doc.data["slug"].to_s] = doc.data["reading_time"]
        end
      }
    end
  end
end

Jekyll::Hooks.register :site, :pre_render do |site|
  Jekyll::ObsidianCompat.note_index(site)
  Jekyll::ObsidianCompat.collect_link_graph(site)
end

Jekyll::Hooks.register :documents, :pre_render do |doc|
  next unless doc.collection.label == "posts"

  doc.content = Jekyll::ObsidianCompat.transform_wiki_syntax(doc, doc.content)
  doc.content = Jekyll::ObsidianCompat.expand_callouts(doc.content)
end

Jekyll::Hooks.register :documents, :post_render do |doc|
  next unless doc.collection.label == "posts"

  Jekyll::ObsidianCompat.rewrite_markdown_image_urls(doc)
end

Jekyll::Hooks.register :pages, :pre_render do |page|
  next unless page.data["homepage"]

  page.content = Jekyll::ObsidianCompat.transform_wiki_syntax(page, page.content)
  page.content = Jekyll::ObsidianCompat.expand_callouts(page.content)
end

Jekyll::Hooks.register :pages, :post_render do |page|
  next unless page.data["homepage"]

  Jekyll::ObsidianCompat.rewrite_markdown_image_urls(page)
end

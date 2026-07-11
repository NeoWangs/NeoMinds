# frozen_string_literal: true

# Let files under MyMind omit Jekyll's usual YYYY-MM-DD filename prefix.
# Each post still needs a date in front matter.
module Jekyll
  OBSIDIAN_POST_FILENAME_MATCHER = %r!^(?:.+/)*(.*)(\.(?:md|markdown|mkd|mkdn|mdown))$!i.freeze

  module ObsidianPostIgnore
    CONTENT_ROOT = "MyMind".freeze
    CONFIG_PATH = File.join(CONTENT_ROOT, ".gitignore").freeze
    DIRECTORY_PATTERN = %r{\A/([^*?!\[\]]+)/?\z}.freeze

    module_function

    def directories(site)
      site.config["obsidian_ignored_post_dirs"] ||= load_directories(site)
    end

    def ignored?(site, path)
      content_root = File.expand_path(site.in_source_dir(CONTENT_ROOT))
      relative = File.expand_path(path).delete_prefix("#{content_root}/")
      directories(site).any? do |directory|
        relative == directory || relative.start_with?("#{directory}/")
      end
    end

    def load_directories(site)
      path = site.in_source_dir(CONFIG_PATH)
      return [] unless File.file?(path)

      File.readlines(path, :encoding => "UTF-8").each_with_object([]) do |line, result|
        rule = line.strip
        next if rule.empty? || rule.start_with?("#")

        match = rule.match(DIRECTORY_PATTERN)
        unless match
          Jekyll.logger.warn "Post ignore:", "Skipping unsupported rule #{rule.inspect}; use /folder/path or /folder/path/."
          next
        end

        directory = match[1].sub(%r{\AMyMind/}, "").sub(%r{/\z}, "")
        parts = directory.split("/")
        next if directory.empty? || parts.any? { |part| part.empty? || part == "." || part == ".." }

        result << directory unless result.include?(directory)
      end
    end
  end

  class PostReader
    def read_posts(dir)
      read_content(dir, ObsidianPostIgnore::CONTENT_ROOT, OBSIDIAN_POST_FILENAME_MATCHER)
        .reject { |doc| ObsidianPostIgnore.ignored?(site, doc.path) }
        .tap { |docs| docs.each(&:read) }
        .select { |doc| processable?(doc) }
    end
  end

  # MyMind is a normal directory name, so Jekyll would otherwise traverse it
  # again as pages and static files after PostReader has loaded its articles.
  # Keep that directory on the dedicated Obsidian content pipeline only.
  module ObsidianContentDirectory
    def retrieve_dirs(base, dir, directories)
      content_root = Jekyll::ObsidianPostIgnore::CONTENT_ROOT
      filtered = directories.reject do |entry|
        Jekyll::PathManager.join(dir, entry).sub(%r{\A/}, "") == content_root
      end
      super(base, dir, filtered)
    end
  end

  Reader.prepend(ObsidianContentDirectory)

  class ObsidianPostAssetFile < StaticFile
    def initialize(site, base, dir, name, post_asset_url)
      super(site, base, dir, name)
      @post_asset_url = post_asset_url
    end

    def url
      @post_asset_url
    end
  end

  class ObsidianVaultAssetFile < StaticFile
    def initialize(site, base, dir, name, asset_url)
      super(site, base, dir, name)
      @asset_url = asset_url
    end

    def url
      @asset_url
    end
  end

  module ObsidianVaultAssets
    SOURCE_ROOT = ObsidianPostIgnore::CONTENT_ROOT
    URL_ROOT = "assets/obsidian".freeze
    MARKDOWN_EXTENSIONS = %w(.md .markdown .mkd .mkdn .mdown).freeze

    module_function

    def register_static_files(site)
      root = site.in_source_dir(SOURCE_ROOT)
      return unless File.directory?(root)

      Dir.glob(File.join(root, "**", "*"), File::FNM_DOTMATCH).sort.each do |path|
        next unless File.file?(path)

        relative_asset_path = path.delete_prefix("#{root}/")
        next if relative_asset_path.split("/").any? { |part| part.start_with?(".") }
        next if MARKDOWN_EXTENSIONS.include?(File.extname(path).downcase)
        next if ObsidianPostIgnore.ignored?(site, path)

        relative_to_source = path.delete_prefix("#{site.source}/")
        dir = File.dirname(relative_to_source)
        name = File.basename(path)
        url = File.join("/", URL_ROOT, relative_asset_path)
        site.static_files << ObsidianVaultAssetFile.new(site, site.source, dir, name, url)
      end
    end
  end

  module ObsidianPostAssets
    IMAGE_SRC_PATTERN = %r{(<img\b[^>]*\bsrc=(["']))([^"']+)(\2)}i.freeze
    IMAGE_EXTENSIONS = %w(.apng .avif .gif .jpg .jpeg .png .svg .webp).freeze

    module_function

    def slug_for(doc)
      configured = doc.data["slug"].to_s.strip
      return configured unless configured.empty?

      File.basename(doc.path, File.extname(doc.path))
    end

    def asset_dir_for(doc)
      File.join(File.dirname(doc.path), slug_for(doc))
    end

    def rewrite_image_urls(doc)
      slug = slug_for(doc)
      asset_dir = asset_dir_for(doc)
      return if slug.empty? || doc.output.to_s.empty?
      return unless File.directory?(asset_dir)

      doc.output = doc.output.gsub(IMAGE_SRC_PATTERN) do
        prefix = Regexp.last_match(1)
        src = Regexp.last_match(3)
        suffix = Regexp.last_match(4)

        next Regexp.last_match(0) unless src.start_with?("#{slug}/")

        relative_asset_path = src.delete_prefix("#{slug}/")
        next Regexp.last_match(0) if relative_asset_path.include?("..")
        next Regexp.last_match(0) unless File.file?(File.join(asset_dir, relative_asset_path))

        "#{prefix}#{File.join(doc.site.baseurl.to_s, doc.url, relative_asset_path)}#{suffix}"
      end
    end

    def register_static_files(site)
      site.posts.docs.each do |post|
        asset_dir = asset_dir_for(post)
        next unless File.directory?(asset_dir)

        Dir.glob(File.join(asset_dir, "**", "*")).sort.each do |path|
          next if File.directory?(path)
          next if File.basename(path).start_with?(".")
          next unless IMAGE_EXTENSIONS.include?(File.extname(path).downcase)

          relative_to_source = path.delete_prefix("#{site.source}/")
          dir = File.dirname(relative_to_source)
          name = File.basename(path)
          relative_asset_path = path.delete_prefix("#{asset_dir}/")
          url = File.join(post.url, relative_asset_path)

          site.static_files << Jekyll::ObsidianPostAssetFile.new(site, site.source, dir, name, url)
        end
      end
    end
  end

  # `MyMind/index.md` is the single homepage source. Promote it to a normal
  # Jekyll page before rendering so it owns `/` without being listed as a post
  # in archives, feeds, search results, or the knowledge graph.
  class ObsidianHomepageGenerator < Generator
    safe true
    priority :highest

    def generate(site)
      homepage = site.posts.docs.find { |doc| doc.data["homepage"] }
      return unless homepage

      page = PageWithoutAFile.new(site, site.source, "", "index.md")
      page.content = homepage.content
      page.data.merge!(homepage.data)
      page.data["permalink"] = "/"

      site.pages << page
      site.posts.docs.delete(homepage)
    end
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  Jekyll::ObsidianPostAssets.register_static_files(site)
  Jekyll::ObsidianVaultAssets.register_static_files(site)
end

Jekyll::Hooks.register :documents, :post_render do |doc|
  next unless doc.collection.label == "posts"

  Jekyll::ObsidianPostAssets.rewrite_image_urls(doc)
end

# frozen_string_literal: true

# Let files under _posts omit Jekyll's usual YYYY-MM-DD filename prefix.
# Each post still needs a date in front matter.
module Jekyll
  OBSIDIAN_POST_FILENAME_MATCHER = %r!^(?:.+/)*(.*)(\.(?:md|markdown|mkd|mkdn|mdown))$!i.freeze

  class PostReader
    def read_posts(dir)
      read_publishable(dir, "_posts", OBSIDIAN_POST_FILENAME_MATCHER)
    end
  end

  class ObsidianPostAssetFile < StaticFile
    def initialize(site, base, dir, name, post_asset_url)
      super(site, base, dir, name)
      @post_asset_url = post_asset_url
    end

    def url
      @post_asset_url
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
end

Jekyll::Hooks.register :site, :post_read do |site|
  Jekyll::ObsidianPostAssets.register_static_files(site)
end

Jekyll::Hooks.register :documents, :post_render do |doc|
  next unless doc.collection.label == "posts"

  Jekyll::ObsidianPostAssets.rewrite_image_urls(doc)
end


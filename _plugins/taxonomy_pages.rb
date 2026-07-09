# frozen_string_literal: true

module Jekyll
  class ObsidianTaxonomyPage < Page
    def initialize(site, base, dir, name, data)
      @site = site
      @base = base
      @dir = dir
      @name = name

      process(name)
      @content = ""
      @data = data
    end
  end

  class ObsidianTaxonomyPageGenerator < Generator
    safe true
    priority :low

    def generate(site)
      site.pages.concat(tag_pages(site))
      site.pages.concat(category_pages(site))
    end

    private

    def tag_pages(site)
      site.tags.keys.sort.map do |tag|
        ObsidianTaxonomyPage.new(
          site,
          site.source,
          File.join("tags", taxonomy_path(tag)),
          "index.html",
          {
            "layout" => "tag",
            "title" => "##{tag}",
            "tag" => tag,
            "permalink" => "/tags/#{taxonomy_path(tag)}/"
          }
        )
      end
    end

    def category_pages(site)
      categories = site.categories.keys.sort
      configured = site.config.dig("obsidian_jekyll", "categories") || []

      categories.map do |category|
        config = configured.find { |item| item["name"] == category } || {}
        title = config["title"] || category

        ObsidianTaxonomyPage.new(
          site,
          site.source,
          File.join("categories", taxonomy_path(category)),
          "index.html",
          {
            "layout" => "category",
            "title" => title,
            "category" => category,
            "permalink" => "/categories/#{taxonomy_path(category)}/"
          }
        )
      end
    end

    def taxonomy_path(value)
      value.to_s.strip.tr("/", "-")
    end
  end
end


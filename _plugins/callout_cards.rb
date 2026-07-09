# frozen_string_literal: true

require "cgi"

module Jekyll
  module ObsidianCalloutCards
    CARD_BLOCK_PATTERN = %r{<section\b([^>]*\bclass=(["'])[^"']*\boj-card\b[^"']*\2[^>]*)>.*?</section>}im.freeze
    TITLE_PATTERN = %r{<div\b([^>]*\bclass=(["'])[^"']*\boj-card__title\b[^"']*\2[^>]*)>(.*?)</div>}im.freeze
    OBSIDIAN_CARD_START_PATTERN = /\A>\s*\[!(?:card|pin|poem)\][+-]?\s*(.*?)\s*\z/i.freeze
    BLOCKQUOTE_LINE_PATTERN = /\A>\s?(.*)\z/.freeze

    module_function

    def parse_markup(markup)
      text = markup.to_s.strip
      split_title_desc(text)
    end

    def split_title_desc(text)
      return ["", ""] if text.empty?

      title, desc = text.split(/\s{2,}/, 2)
      return [title.to_s.strip, desc.to_s.strip] if desc

      if text =~ /\s+([【\[].*)\z/
        [$`.strip, Regexp.last_match(1).strip]
      else
        [text, ""]
      end
    end

    def normalize_card_block(card_html)
      return card_html if card_html.match?(/\bclass=(["'])[^"']*\boj-card__desc\b[^"']*\1/i)

      card_html.sub(TITLE_PATTERN) do
        attrs = Regexp.last_match(1)
        title_html = Regexp.last_match(3)
        title_text = CGI.unescapeHTML(title_html.gsub(/<[^>]*>/, "").strip)
        title, desc = split_title_desc(title_text)
        next Regexp.last_match(0) if desc.empty?

        %(<div#{attrs}>#{CGI.escapeHTML(title)}</div><div class="oj-card__desc">#{CGI.escapeHTML(desc)}</div>)
      end
    end

    def render_card(title, desc, content)
      title_html = CGI.escapeHTML(title.to_s)
      desc_html = CGI.escapeHTML(desc.to_s)
      content_html = CGI.escapeHTML(content.to_s.strip)
      desc_block = desc_html.empty? ? "" : %(\n    <div class="oj-card__desc">#{desc_html}</div>)

      <<~HTML
        <section class="oj-card">
          <div class="oj-card__body">
            <div class="oj-card__title">#{title_html}</div>#{desc_block}
            <pre>#{content_html}</pre>
          </div>
        </section>
      HTML
    end

    def expand_obsidian_callouts(markdown)
      lines = markdown.to_s.lines(chomp: true)
      expanded = []
      index = 0

      while index < lines.length
        line = lines[index]
        match = line.match(OBSIDIAN_CARD_START_PATTERN)

        unless match
          expanded << line
          index += 1
          next
        end

        title, desc = parse_markup(match[1])
        body_lines = []
        index += 1

        while index < lines.length
          body_match = lines[index].match(BLOCKQUOTE_LINE_PATTERN)
          break unless body_match

          body_lines << body_match[1]
          index += 1
        end

        expanded << render_card(title, desc, body_lines.join("\n"))
      end

      expanded.join("\n") + (markdown.to_s.end_with?("\n") ? "\n" : "")
    end

    def wrap_consecutive_cards(output)
      return output unless output.to_s.match?(/\bclass=(["'])[^"']*\boj-card\b/i)

      matches = []
      output.to_enum(:scan, CARD_BLOCK_PATTERN).each do
        matches << {
          start: Regexp.last_match.begin(0),
          end: Regexp.last_match.end(0),
          text: Regexp.last_match[0]
        }
      end
      return output if matches.empty?

      result = +""
      cursor = 0
      index = 0

      while index < matches.length
        result << output[cursor...matches[index][:start]]

        group = [matches[index]]
        next_index = index + 1
        while next_index < matches.length && output[group.last[:end]...matches[next_index][:start]].to_s.match?(/\A\s*\z/)
          group << matches[next_index]
          next_index += 1
        end

        result << %(<div class="oj-card-wrap">\n)
        result << group.map { |card| normalize_card_block(card[:text]) }.join("\n")
        result << "\n</div>"

        cursor = group.last[:end]
        index = next_index
      end

      result << output[cursor..]
      result
    end
  end

  class CardBlock < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @title, @desc = ObsidianCalloutCards.parse_markup(markup)
    end

    def render(context)
      ObsidianCalloutCards.render_card(@title, @desc, super)
    end
  end
end

Liquid::Template.register_tag("card", Jekyll::CardBlock)
Liquid::Template.register_tag("pin", Jekyll::CardBlock)

%i[documents pages].each do |owner|
  Jekyll::Hooks.register owner, :pre_render do |doc|
    doc.content = Jekyll::ObsidianCalloutCards.expand_obsidian_callouts(doc.content)
  end
end

%i[documents pages].each do |owner|
  Jekyll::Hooks.register owner, :post_render do |doc|
    doc.output = Jekyll::ObsidianCalloutCards.wrap_consecutive_cards(doc.output)
  end
end


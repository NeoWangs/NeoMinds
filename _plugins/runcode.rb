# frozen_string_literal: true

require "cgi"
require "securerandom"

module Jekyll
  module ObsidianRuncode
    FENCED_RUNCODE_PATTERN = /^```(?<info>[^\n`]*\bruncode\b[^\n`]*)\n(?<code>.*?)^```\s*$/m.freeze

    module_function

    def render(code, id = nil)
      id ||= "runcode_#{SecureRandom.uuid}"
      escaped_id = CGI.escapeHTML(id.to_s)
      escaped_code = CGI.escapeHTML(code.to_s.strip)

      <<~HTML
        <div class="runcode"><textarea class="runcode__text" id="#{escaped_id}">#{escaped_code}</textarea><div class="runcode__actions"><button type="button" class="runcode__button" onclick="runcode.open('#{escaped_id}')">Run</button><button type="button" class="runcode__button" onclick="runcode.copy('#{escaped_id}')">Copy</button></div></div>
      HTML
    end

    def expand_fences(markdown)
      markdown.to_s.gsub(FENCED_RUNCODE_PATTERN) do
        info = Regexp.last_match[:info].to_s
        code = Regexp.last_match[:code]
        id = info[/\bid=([^\s]+)/, 1]

        render(code, id).rstrip
      end
    end
  end

  class RuncodeBlock < Liquid::Block
    def render(context)
      ObsidianRuncode.render(super, "runcode_#{SecureRandom.uuid}")
    end
  end
end

Liquid::Template.register_tag("runcode", Jekyll::RuncodeBlock)

%i[documents pages].each do |owner|
  Jekyll::Hooks.register owner, :pre_render do |doc|
    doc.content = Jekyll::ObsidianRuncode.expand_fences(doc.content)
  end
end


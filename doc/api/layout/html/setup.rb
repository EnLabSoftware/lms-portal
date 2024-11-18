# frozen_string_literal: true

#
# Copyright (C) 2024 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

def diskfile
  content = "<div id='filecontents'>" +
            case (File.extname(@file)[1..] || "").downcase
            when "htm", "html"
              @contents
            when "txt"
              "<pre>#{@contents}</pre>"
            when "textile", "txtile"
              htmlify(@contents, :textile)
            when "markdown", "md", "mdown", "mkd"
              htmlify(@contents, :markdown)
            else
              htmlify(@contents, diskfile_shebang_or_default)
            end +
            "</div>"
  options.delete(:no_highlight)
  content
end
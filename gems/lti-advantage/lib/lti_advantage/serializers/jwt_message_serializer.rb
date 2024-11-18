# frozen_string_literal: true

#
# Copyright (C) 2018 - present Instructure, Inc.
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

module LtiAdvantage::Serializers
  class JwtMessageSerializer
    IMS_CLAIM_PREFIX = "https://purl.imsglobal.org/spec/lti/claim/"
    DL_CLAIM_PREFIX = "https://purl.imsglobal.org/spec/lti-dl/claim/"

    STANDARD_IMS_CLAIMS = %w[
      context
      custom
      deployment_id
      launch_presentation
      lis
      message_type
      resource_link
      role_scope_mentor
      roles
      tool_platform
      version
      target_link_uri
      lti11_legacy_user_id
      lti1p1
    ].freeze

    DEEP_LINKING_CLAIMS = %w[
      deep_linking_settings
      content_items
    ].freeze

    CLAIM_MAPPING = [
      *STANDARD_IMS_CLAIMS.map { [_1, IMS_CLAIM_PREFIX + _1] },
      *DEEP_LINKING_CLAIMS.map { [_1, DL_CLAIM_PREFIX + _1] },
    ].to_h.merge(
      "names_and_roles_service" =>
        "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice",
      "assignment_and_grade_service" =>
        "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint",
      "platform_notification_service" =>
        "https://purl.imsglobal.org/spec/lti/claim/platformnotificationservice"
    ).freeze

    def initialize(object)
      @object = object
    end

    def serializable_hash
      hash = apply_claim_prefixes(@object.as_json.compact)
      promote_extensions(hash)
    end

    private

    def promote_extensions(hash)
      extensions = hash.delete("extensions")
      extensions.present? ? hash.merge(extensions) : hash
    end

    def apply_claim_prefixes(hash)
      hash.transform_keys { |key| CLAIM_MAPPING[key] || key }
    end
  end
end
import React from "react"
import {Tooltip} from "@instructure/ui-tooltip"
import {View} from "@instructure/ui-view"
import {Pill} from "@instructure/ui-pill";
import {object, string} from "prop-types";
import {useScope as useI18nScope} from "@canvas/i18n";

const I18n = useI18nScope('feature_flags')

export default function StatusPill({feature, updatedState}) {
  const state = updatedState || feature.feature_flag.state
  return <>
    {state === "hidden" && !feature.shadow && (
      <Tooltip
        renderTip={
          <View as="div" width="600px">
            {I18n.t(
              `This feature option is only visible to users with Site Admin access.
                            End users will not see it until enabled by a Site Admin user.
                            Before enabling for an institution, please be sure you fully understand
                            the functionality and possible impacts to users.`
            )}
          </View>
        }
      >
        <Pill margin="0 x-small" themeOverride={{maxWidth: 'none'}}>
          {I18n.t('Hidden')}
        </Pill>
      </Tooltip>
    )}
    {feature.shadow && (
      <Tooltip
        renderTip={
          <View as="div" width="600px">
            {I18n.t(
              `This feature option is only visible to users with Site Admin access. It is similar to
                          "Hidden", but end users will not see it even if enabled by a Site Admin user.`
            )}
          </View>
        }
      >
        <Pill color="alert" margin="0 x-small" themeOverride={{maxWidth: 'none'}}>
          {I18n.t('Shadow')}
        </Pill>
      </Tooltip>
    )}
    {feature.beta && (
      <Tooltip
        renderTip={I18n.t(
          'Feature preview — opting in includes ongoing updates outside the regular release schedule'
        )}
      >
        <Pill color="info" margin="0 0 0 x-small" themeOverride={{maxWidth: 'none'}}>
          {I18n.t('Feature Preview')}
        </Pill>
      </Tooltip>
    )}
  </>
}

StatusPill.propTypes = {
  feature: object.isRequired,
  updatedState: string
}
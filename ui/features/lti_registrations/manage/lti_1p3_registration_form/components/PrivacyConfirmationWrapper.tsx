/*
 * Copyright (C) 2024 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {useOverlayStore} from '../hooks/useOverlayStore'
import type {Lti1p3RegistrationOverlayStore} from '../Lti1p3RegistrationOverlayState'
import {LtiPrivacyLevels} from '../../model/LtiPrivacyLevel'
import {PrivacyConfirmation} from '../../registration_wizard_forms/PrivacyConfirmation'
import {RegistrationModalBody} from '../../registration_wizard/RegistrationModalBody'

export type PrivacyConfirmationWrapperProps = {
  overlayStore: Lti1p3RegistrationOverlayStore
  appName: string
}

export const PrivacyConfirmationWrapper = ({
  overlayStore,
  appName,
}: PrivacyConfirmationWrapperProps) => {
  const [state, actions] = useOverlayStore(overlayStore)

  return (
    <RegistrationModalBody>
      <PrivacyConfirmation
        appName={appName}
        privacyLevelOnChange={actions.setPrivacyLevel}
        selectedPrivacyLevel={state.data_sharing.privacy_level ?? LtiPrivacyLevels.Anonymous}
      />
    </RegistrationModalBody>
  )
}
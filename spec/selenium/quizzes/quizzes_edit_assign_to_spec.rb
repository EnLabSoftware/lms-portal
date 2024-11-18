# frozen_string_literal: true

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
require_relative "../common"
require_relative "../helpers/quizzes_common"
require_relative "../../spec_helper"
require_relative "page_objects/quizzes_edit_page"
require_relative "page_objects/quizzes_landing_page"
require_relative "../helpers/items_assign_to_tray"
require_relative "../helpers/context_modules_common"
require_relative "../../helpers/selective_release_common"
require_relative "../helpers/admin_settings_common"

describe "quiz edit page assign to" do
  include_context "in-process server selenium tests"
  include QuizzesEditPage
  include QuizzesLandingPage
  include ItemsAssignToTray
  include ContextModulesCommon
  include QuizzesCommon
  include SelectiveReleaseCommon

  before :once do
    Account.site_admin.disable_feature!(:selective_release_edit_page)

    course_with_teacher(active_all: true)
    @quiz_assignment = @course.assignments.create
    @quiz_assignment.quiz = @course.quizzes.create(title: "test quiz")
    @classic_quiz = @course.quizzes.last

    @student1 = student_in_course(course: @course, active_all: true, name: "Student 1").user
    @student2 = student_in_course(course: @course, active_all: true, name: "Student 2").user
  end

  before do
    user_session(@teacher)
  end

  it "brings up the assign to tray from edit when selecting the manage assign to link" do
    get "/courses/#{@course.id}/quizzes/#{@classic_quiz.id}/edit"

    click_manage_assign_to_button

    wait_for_assign_to_tray_spinner
    keep_trying_until { expect(item_tray_exists?).to be_truthy }

    expect(tray_header.text).to eq("test quiz")
    expect(icon_type_exists?("Quiz")).to be true
  end

  it "assigns student and saves assignment", :ignore_js_errors do
    get "/courses/#{@course.id}/quizzes/#{@classic_quiz.id}/edit"

    click_manage_assign_to_button

    wait_for_assign_to_tray_spinner
    keep_trying_until { expect(item_tray_exists?).to be_truthy }

    click_add_assign_to_card
    select_module_item_assignee(1, @student1.name)
    update_due_date(1, "12/31/2022")
    update_due_time(1, "5:00 PM")
    update_available_date(1, "12/27/2022")
    update_available_time(1, "8:00 AM")
    update_until_date(1, "1/7/2023")
    update_until_time(1, "9:00 PM")

    click_save_button("Apply")
    keep_trying_until { expect(item_tray_exists?).to be_falsey }
    expect(pending_changes_pill_exists?).to be_truthy

    submit_page

    expect(@classic_quiz.assignment_overrides.last.assignment_override_students.count).to eq(1)

    due_at_row = retrieve_quiz_due_date_table_row("1 Student")
    expect(due_at_row).not_to be_nil
    expect(due_at_row.text.split("\n").first).to include("Dec 31, 2022")
    expect(due_at_row.text.split("\n").third).to include("Dec 27, 2022")
    expect(due_at_row.text.split("\n").last).to include("Jan 7, 2023")

    due_at_row = retrieve_quiz_due_date_table_row("Everyone else")
    expect(due_at_row).not_to be_nil
    expect(due_at_row.text.count("-")).to eq(3)
  end

  it "saves and shows override updates when tray reaccessed" do
    get "/courses/#{@course.id}/quizzes/#{@classic_quiz.id}/edit"

    click_manage_assign_to_button

    wait_for_assign_to_tray_spinner
    keep_trying_until { expect(item_tray_exists?).to be_truthy }

    update_due_date(0, "12/31/2022")
    update_due_time(0, "5:00 PM")
    update_available_date(0, "12/27/2022")
    update_available_time(0, "8:00 AM")
    update_until_date(0, "1/7/2023")
    update_until_time(0, "9:00 PM")

    click_save_button("Apply")
    keep_trying_until { expect(element_exists?(module_item_edit_tray_selector)).to be_falsey }

    click_manage_assign_to_button
    wait_for_assign_to_tray_spinner

    keep_trying_until { expect(item_tray_exists?).to be_truthy }

    expect(assign_to_due_date(0).attribute("value")).to eq("Dec 31, 2022")
    expect(assign_to_due_time(0).attribute("value")).to eq("5:00 PM")
    expect(assign_to_available_from_date(0).attribute("value")).to eq("Dec 27, 2022")
    expect(assign_to_available_from_time(0).attribute("value")).to eq("8:00 AM")
    expect(assign_to_until_date(0).attribute("value")).to eq("Jan 7, 2023")
    expect(assign_to_until_time(0).attribute("value")).to eq("9:00 PM")
  end

  it "does not update overrides after tray save on edit page" do
    get "/courses/#{@course.id}/quizzes/#{@classic_quiz.id}/edit"

    click_manage_assign_to_button

    wait_for_assign_to_tray_spinner
    keep_trying_until { expect(item_tray_exists?).to be_truthy }

    update_due_date(0, "12/31/2022")
    update_due_time(0, "5:00 PM")
    update_available_date(0, "12/27/2022")
    update_available_time(0, "8:00 AM")
    update_until_date(0, "1/7/2023")
    update_until_time(0, "9:00 PM")

    click_save_button("Apply")
    keep_trying_until { expect(element_exists?(module_item_edit_tray_selector)).to be_falsey }
    expect(@classic_quiz.assignment_overrides.count).to eq(0)

    cancel_quiz_edit

    expect(@classic_quiz.assignment_overrides.count).to eq(0)
  end

  it "disables submit button when tray is open" do
    get "/courses/#{@course.id}/quizzes/#{@classic_quiz.id}/edit"

    click_manage_assign_to_button

    wait_for_assign_to_tray_spinner
    keep_trying_until { expect(item_tray_exists?).to be_truthy }
    expect(quiz_save_button).to be_disabled

    click_cancel_button
    expect(quiz_save_button).to be_enabled
  end

  it "focus close button on open" do
    get "/courses/#{@course.id}/quizzes/#{@classic_quiz.id}/edit"

    click_manage_assign_to_button

    wait_for_assign_to_tray_spinner
    keep_trying_until { expect(item_tray_exists?).to be_truthy }

    check_element_has_focus close_button
  end

  it "does not recover a deleted card when adding an assignee" do
    # Bug fix of LX-1619
    get "/courses/#{@course.id}/quizzes/#{@classic_quiz.id}/edit"
    click_manage_assign_to_button

    wait_for_assign_to_tray_spinner
    keep_trying_until { expect(item_tray_exists?).to be_truthy }

    click_add_assign_to_card
    click_delete_assign_to_card(0)
    select_module_item_assignee(0, @student2.name)

    expect(selected_assignee_options.count).to be(1)
  end

  context "sync to sis" do
    include AdminSettingsCommon
    include ItemsAssignToTray

    let(:due_date) { 3.years.from_now }

    before do
      account_model
      @account.set_feature_flag! "post_grades", "on"
      course_with_teacher_logged_in(active_all: true, account: @account)
      turn_on_sis_settings(@account)
      @account.settings[:sis_require_assignment_due_date] = { value: true }
      @account.save!
      @quiz = course_quiz
      @quiz.post_to_sis = "1"
    end

    it "validates due date inputs when sync to sis is enabled", :ignore_js_errors do
      get "/courses/#{@course.id}/quizzes/#{@quiz.id}/edit"

      click_manage_assign_to_button

      wait_for_assign_to_tray_spinner

      expect(assign_to_date_and_time[0].text).not_to include("Please add a due date")

      click_save_button("Apply")
      keep_trying_until { expect(element_exists?(module_item_edit_tray_selector)).to be_falsey }

      click_post_to_sis_checkbox
      click_manage_assign_to_button

      wait_for_assign_to_tray_spinner
      keep_trying_until { expect(item_tray_exists?).to be_truthy }

      expect(assign_to_date_and_time[0].text).to include("Please add a due date")

      update_due_date(0, format_date_for_view(due_date, "%-m/%-d/%Y"))
      update_due_time(0, "11:59 PM")
      click_save_button("Apply")
      keep_trying_until { expect(element_exists?(module_item_edit_tray_selector)).to be_falsey }
    end

    it "blocks saving empty due dates when enabled", :ignore_js_errors do
      get "/courses/#{@course.id}/quizzes/#{@quiz.id}/edit"

      click_post_to_sis_checkbox

      wait_for_ajaximations

      expect(driver.current_url).to include("edit")

      click_quiz_save_button

      expect_instui_flash_message("Please set a due date or change your selection for the “Sync to SIS” option.")

      click_manage_assign_to_button

      wait_for_assign_to_tray_spinner
      keep_trying_until { expect(item_tray_exists?).to be_truthy }

      expect(assign_to_date_and_time[0].text).to include("Please add a due date")

      update_due_date(0, format_date_for_view(Time.zone.now, "%-m/%-d/%Y"))
      update_due_time(0, "11:59 PM")
      click_save_button("Apply")
      keep_trying_until { expect(element_exists?(module_item_edit_tray_selector)).to be_falsey }

      expect(is_checked(post_to_sis_checkbox_selector)).to be_truthy
    end

    it "does not block empty due dates when disabled" do
      get "/courses/#{@course.id}/quizzes/#{@quiz.id}/edit"

      expect(is_checked(post_to_sis_checkbox_selector)).to be_falsey
      click_quiz_save_button
      expect(driver.current_url).not_to include("edit")

      get "/courses/#{@course.id}/quizzes/#{@quiz.id}/edit"
      expect(is_checked(post_to_sis_checkbox_selector)).to be_falsey
    end

    it "validates due date when user checks/unchecks the option", :ignore_js_errors do
      get "/courses/#{@course.id}/quizzes/#{@quiz.id}/edit"

      click_manage_assign_to_button
      wait_for_assign_to_tray_spinner
      keep_trying_until { expect(item_tray_exists?).to be_truthy }

      expect(assign_to_date_and_time[0].text).not_to include("Please add a due date")

      click_cancel_button
      keep_trying_until { expect(element_exists?(module_item_edit_tray_selector)).to be_falsey }

      click_post_to_sis_checkbox
      click_manage_assign_to_button
      wait_for_assign_to_tray_spinner
      keep_trying_until { expect(item_tray_exists?).to be_truthy }

      expect(assign_to_date_and_time[0].text).to include("Please add a due date")

      update_due_date(0, format_date_for_view(Time.zone.now, "%-m/%-d/%Y"))
      update_due_time(0, "11:59 PM")
      click_save_button("Apply")
      keep_trying_until { expect(element_exists?(module_item_edit_tray_selector)).to be_falsey }

      click_quiz_save_button
      expect(driver.current_url).not_to include("edit")
    end
  end
end
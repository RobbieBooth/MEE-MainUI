import React from "react";

import {
    BaseSetting, GroupSetting,
    InputSetting,
    SettingType,
    ToggleDisplay,
    ToggleSetting
} from "~/components/settings/compositeSettings";
import {DynamicForm} from "~/components/settings/greenMan/DynamicForm";

// const settings: BaseSetting[] = [
//     {
//         type: SettingType.Toggle,
//         label: "Enable Feature",
//         tooltip: "Toggle the feature on or off",
//         required: true,
//         disabled: false,
//         value: true,
//         display: ToggleDisplay.Switch,
//     }as ToggleSetting, // Cast to ToggleSetting
//     {
//         type: SettingType.Input,
//         label: "Username",
//         tooltip: "Enter your username",
//         required: true,
//         disabled: false,
//         value: "JohnDoe",
//         maxCharacters: 50,
//         maxLines: "1",
//     }as InputSetting,
//     {
//         type: SettingType.Group,
//         label: "Group Settings",
//         tooltip: "Group of settings",
//         required: false,
//         disabled: false,
//         children: [
//             {
//                 type: SettingType.Toggle,
//                 label: "Enable Notifications",
//                 tooltip: "Toggle notifications",
//                 required: false,
//                 disabled: false,
//                 value: false,
//                 display: ToggleDisplay.Checkbox,
//             } as ToggleSetting,
//         ],
//         add(setting: BaseSetting) {
//
//         },
//         remove(setting: BaseSetting) {
//         },
//         getChildren(): BaseSetting[] {
//             return [];
//         }
//     } as GroupSetting,
// ];

const SETTING_JSON_EXAMPLE = `[
  {
    "type": "Toggle",
    "label": "Enable Feature",
    "tooltip": "Toggle the feature on or off",
    "required": true,
    "disabled": false,
    "value": true,
    "display": "Switch"
  },
  {
    "type": "Input",
    "label": "Username",
    "tooltip": "Enter your username",
    "required": true,
    "disabled": false,
    "value": "JohnDoe",
    "maxCharacters": 50,
    "maxLines": "1"
  },
  {
    "type": "Group",
    "label": "Group Settings",
    "tooltip": "Group of settings",
    "required": false,
    "disabled": false,
    "children": [
      {
        "type": "Toggle",
        "label": "Enable Notifications",
        "tooltip": "Toggle notifications",
        "required": false,
        "disabled": false,
        "value": false,
        "display": "Checkbox"
      }
    ]
  },
  {
    "type": "ListSetting",
    "label": "User Configuration",
    "tooltip": "Manage multiple user settings",
    "required": false,
    "disabled": false,
    "allowAddition": true,
    "allowRemoval": true,
    "maxAmount": 5,
    "minAmount": 1,
    "settingToAdd": {
      "type": "Input",
      "label": "Username",
      "tooltip": "Enter your username",
      "required": true,
      "disabled": false,
      "value": "JohnDoe",
      "maxCharacters": 50,
      "maxLines": "1"
    },
    "children": [
      {
        "type": "Group",
        "label": "Admin Settings",
        "tooltip": "Settings for admin users",
        "required": false,
        "disabled": false,
        "children": [
          {
            "type": "Toggle",
            "label": "Enable Admin Mode",
            "tooltip": "Toggle admin mode on or off",
            "required": true,
            "disabled": false,
            "value": true,
            "display": "Switch"
          },
          {
            "type": "Input",
            "label": "Admin Username",
            "tooltip": "Enter the admin username",
            "required": true,
            "disabled": false,
            "value": "AdminUser",
            "maxCharacters": 20,
            "maxLines": "1"
          }
        ]
      },
      {
        "type": "Group",
        "label": "User Preferences",
        "tooltip": "Settings for regular users",
        "required": false,
        "disabled": false,
        "children": [
          {
            "type": "Select",
            "label": "Theme",
            "tooltip": "Choose a theme",
            "required": false,
            "disabled": false,
            "value": ["Light"],
            "availableValues": ["Light", "Dark", "System"],
            "multiSelect": false
          },
          {
            "type": "File",
            "label": "Upload Profile Picture",
            "tooltip": "Upload an image for the profile picture",
            "required": false,
            "disabled": false,
            "files": [],
            "fileTypesAllowed": {
              "image/*": [],
              "application/pdf": [".pdf"]
            },
            "maxFileCount": 1,
            "maxCumulativeFileSizeBytes": 1048576
          },
          {
            "type": "Select",
            "label": "Theme2",
            "tooltip": "Choose a theme",
            "required": false,
            "disabled": false,
            "value": ["Light", "Dark"],
            "availableValues": ["Light", "Dark", "System", "Home", "Away"],
            "multiSelect": true
          }
        ]
      }
    ]
  },
  {
    "type": "ConditionalSetting",
    "label": "Enable Advanced Options",
    "tooltip": "Toggle to show or hide advanced settings",
    "required": false,
    "disabled": false,
    "condition": {
      "type": "Toggle",
      "label": "Advanced Options",
      "tooltip": "Enable or disable advanced options",
      "required": true,
      "disabled": false,
      "value": true,
      "display": "Switch"
    },
    "group": {
      "type": "Group",
      "label": "User Preferences",
      "tooltip": "Settings for regular users",
      "required": false,
      "disabled": false,
      "children": [
        {
          "type": "Input",
          "label": "Custom URL",
          "tooltip": "Provide a custom URL",
          "required": true,
          "disabled": false,
          "value": "https://example.com",
          "maxCharacters": 100,
          "maxLines": "1"
        },
        {
          "type": "Select",
          "label": "Preferred Format",
          "tooltip": "Select a preferred file format",
          "required": false,
          "disabled": false,
          "value": [
            "PDF"
          ],
          "availableValues": [
            "PDF",
            "DOCX",
            "TXT"
          ],
          "multiSelect": false
        },
        {
          "type": "Group",
          "label": "Advanced Settings Group",
          "tooltip": "Additional advanced options",
          "required": false,
          "disabled": false,
          "children": [
            {
              "type": "Toggle",
              "label": "Enable Logging",
              "tooltip": "Enable detailed logging",
              "required": false,
              "disabled": false,
              "value": false,
              "display": "Checkbox"
            },
            {
              "type": "Input",
              "label": "Log File Path",
              "tooltip": "Specify the log file path",
              "required": true,
              "disabled": false,
              "value": "/var/log/app.log",
              "maxCharacters": 200,
              "maxLines": "1"
            }
          ]
        }
      ]
    }
    }

  ]`;

export default function test(){
    return <DynamicForm settings={SETTING_JSON_EXAMPLE} />;
}

# SmarterTabSwitching CSE403 WIN23

## Project Description:
Our idea is to add a user-friendly way to cycle through tabs in the same window in Google Chrome, by order of the most recently opened tab. This should allow us to access our previously visited tab regardless of its location within other tabs with a simple click of the keyboard commands CTRL+Q. Additionally, if the user holds down CTRL and then presses Q however many times they want to press Q, the extension does the same thing as before and switches to the appropriate tab, but also displays a mini tab window pop up. This is similar to how the Windows OS’s alt-tab feature works. We also want to include options for customization such as changing keybindings and retaining the original functionality.

## Getting started/Contributing
How to build our project, run it, and test it? 
See our [wiki](https://github.com/paulstn/SmarterTabSwitching/wiki) for information.

## Functionality so far (working use cases):
Unfortunately, the below features only work with tabs that are not new tabs (tabs without a website loaded) or internal chrome websites (like chrome://extensions). 
1. Base functionality works on all tabs, besides the ones that Chrome tries to protect from content scripts. Pressing CTRL and Q (but letting go of CTRL first) will do automatic switching without the need for previews.
2. Multiple Tab Switching works, without preview images so far. When pressing CTRL and Q, and then letting go of Q but holding on to CTRL, a popup will be displayed on the screen. Then, if you press Q again, the tab that is going to be switched to will move to the next one in the list of most recently used tabs. Repeatedly pressing Q will go down the list until it cycles back. There will be text within a popup box showing how far back the tab selection is at.

## Features:
1. Switching to most recently used tab from CTRL+TAB
2. Holding down CTRL + TAB brings up previews
3. Customizable keybindings
4. Original functionality with left-right movement on new keybinds (CTRL + Left & right)

## Stretch Goals:
1. “Pinned Tabs”: Keybind to open a specific tab regardless of placement or recency
2. Tab sorting by similar domains (.google.com, etc.)

## Known Issues:
Look under the 'Issues' tab of our repository. There are detailed explanations of what our known issues are and plans to fix them.

## Repository Layout
### reports
<pre>
  Contains weekly team report and individual report files.
</pre>

### src
<pre>
  Has the source code of the project
</pre>

### test
<pre>
  Contains test code to be run
</pre>

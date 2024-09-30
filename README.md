<p align="center">
<img alt='Investment Tracker Logo' width="400"  src='./public/logo.webp'/>
<br/>
<span>A free & open-source software for tracking fixed-income investments, and could provide earning date tracking and earning value estimate.</span>
<br/>
<span>Made by <a href="https://github.com/BenjaminYe36">Guangyin Ye</a></span>
</p>

[comment]: <> (The start of badges part)
[![GitHub Release](https://img.shields.io/github/v/release/benjaminye36/investment-tracker?logo=github)](https://github.com/BenjaminYe36/investment-tracker/releases/latest)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/benjaminye36/investment-tracker/.github%2Fworkflows%2Fbuild-on-3-platforms.yml?logo=Tauri&label=Build%20on%203%20platforms)](https://github.com/BenjaminYe36/investment-tracker/actions/workflows/build-on-3-platforms.yml)
[![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/benjaminye36/investment-tracker/total)](https://github.com/BenjaminYe36/investment-tracker/releases)
[![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/benjaminye36/investment-tracker/main)](https://github.com/BenjaminYe36/investment-tracker/commits/main/)
[![GitHub License](https://img.shields.io/github/license/benjaminye36/investment-tracker)](https://github.com/BenjaminYe36/investment-tracker/blob/main/LICENSE)

## Changes & Features
- Polished up for a public release v1.5.0
- Quick filtering by owner, marketplace, bank, and start & end time within the side drawer
- Interactive data grid (edit, delete, hide, sort, filter) to show the records
- Autocomplete based on current records when adding new records
- Highlight for already past maturity records, and most recent get money date
- Earning estimates
- Auto theme (Light/Dark) based on system preferences, and can be changed in settings

## Screenshots
<p align="left">
  <img alt='Investment Tracker Screenshot d1' src='./public/investment-tracker-d-1.png'/>
  <img alt='Investment Tracker Screenshot d2' src='./public/investment-tracker-d-2.png'/>
  <img alt='Investment Tracker Screenshot d3' src='./public/investment-tracker-d-3.png'/>
  <img alt='Investment Tracker Screenshot l1' src='./public/investment-tracker-l-1.png'/>
  <img alt='Investment Tracker Screenshot l1' src='./public/investment-tracker-l-2.png'/>
  <img alt='Investment Tracker Screenshot 13' src='./public/investment-tracker-l-3.png'/>
</p>

## Download page
[See release here](https://github.com/BenjaminYe36/investment-tracker/releases)

## User Guide
- Coming soon

## Testing & Building
### Pre-req for testing

- Rust & System specific pre-req ([please view Tauri doc here](https://tauri.app/v1/guides/getting-started/prerequisites))
- NodeJs & npm

### Testing instructions
1. git clone this repo or download source code and extract
2. install Tauri pre-req by following [this guide](https://tauri.app/v1/guides/getting-started/prerequisites)
3. run `npm install` under project folder
4. run `npm run tauri dev` for dev build testing

### Building
run command `npm run tauri build` for creating distribution for your platform

## Many Thanks to Tauri, MUI and their documentation

- You could learn more about Tauri [here](https://tauri.app/)
- You could learn more about MUI [here](https://mui.com/)

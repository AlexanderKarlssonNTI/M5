<!-- Some of the ASCII art is intentionally misaligned without markdown to correctly align in the proper view with markdown. A preview of this can usually be shown in VS Code via the keybindings ctrl + shift + v -->
```
  _______          ____        ____________     __     __          _______         ______
|   ____  \      /  __  \     |____    ____|   |  |   |  |       /   ___   \     /   __   \
|  |    |  |    /  /  \  \         |  |	       |  |   |  |      |   /   \   |   |   |  |___|
|  |    |  |   |  |    |  |        |  |	       |  |___|  |      |  |     |  |   |   |
|  |____|  |   |  |____|  |        |  |	       |   ___   |      |  |     |  |   |    \ __
|   _____ /    |   ____   |        |  |	       |  |   |  |      |  |     |  |    \ ___    \
|  |	       |  |    |  |        |  |	       |  |   |  |      |  |     |  |    __   |    |
|  |           |  |    |  |        |  |	       |  |   |  |      |   \___/   |   |  |__|    |
|__|           |__|    |__|        |__|	       |__|   |__|       \ _______ /     \ ______ /
```
# Introductory description
Path Operating System is a web application which builds maps of connected entities in multiple variants and executes pathfinding algorithms to find optimal paths between any two points on any map. All of this is visualized via a javascript generated, CSS flexed grid-like layout of HTML elements representing each room as well as the paths and spaces between them. This allows solid interactability and ease of appliance for styling of the display components. Maps, which can be previewed during creation, are saved and accessible from a load menu. Changes made to the paths and rooms of maps can also be saved. As for the aesthetics, Path OS aims for a retro-look that explicitly is the Commodore 64.
<br>
<br>
This program stores its map data in two separate and selectable ways. One of them utilizes an API built in the PHP framework Laravel and the other is localstorage, a well suited alternative which requires less external components and has faster transfer speed. Knowledge regarding how to work with either of these data managing systems can be found below.

# Laravel server setup

## Prerequisites

- **[MySQL or alike, installed via a program such as XAMPP](https://www.apachefriends.org/)**
- **[PHP](https://www.php.net/downloads.php)**
- **[A tool to download dependencies with, for example Composer](https://getcomposer.org/download/)**

Download the repository, this can be done via the "code" options on this Github page. To link it for commits, use a URL found in the same options.

Run MySQL or any equivalent and make sure there's an existing database which is linked via its name in the environment configuration under the DB_DATABASE field, likely on line 14 in the Laravel setup's ".env" file (rename from ".env.example" to ".env" to apply the file)

## The following commands can be used to get started:

### Setup commands for the installation which are typically only runned once on new devices that have downloaded a repository using Laravel.
- composer update - download dependencies such as contents of the vendor folder
- php artisan key:generate - Create key obligatorily required by Laravel for more secure web browser cookie management
- php artisan migrate - Apply tables from "App\database\migrations" to the linked database, but the same migration files cannot be migrated again without a reset of the database

### Common commands used when working with Laravel
- php artisan serve - Run a local server
- php artisan migrate:fresh - Shortcut to execute the effects of "php artisan migrate:reset" followed by "php artisan migrate" to reapply migration files


# Using localstorage
When separately opening web pages, HTML document files that is, they also have separate domains with their own entities of localstorage. To make a unified space allowing shared localstorage across multiple web pages, the files can be opened over a local server. One way to do this is by utilizing npm, provided you have or get it installed, running the two following commands in which npx is a part of npm.
- "npm install -g local-web-server" - Install this program globally
- "npx local-web-server" - Run the local server, placed wherever the terminal doing it had its path set <br>
When active, the port "http://192.168.0.147:8000" can prefix files to browse them on the local server, navigating from the path the terminal running the server is set to.
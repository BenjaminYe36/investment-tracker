import {BaseDirectory, createDir, readTextFile, writeTextFile} from "@tauri-apps/api/fs";

interface SettingsObj {
    theme: 'light' | 'dark'; // whether the theme is dark theme or not
}

class Settings {
    static async getTheme(theme: 'light' | 'dark'): Promise<'light' | 'dark'> {
        return readTextFile('Database/Settings.json', {dir: BaseDirectory.App})
            .then((contents) => {
                console.log('found settings file');
                const obj = JSON.parse(contents);
                return obj.theme;
            })
            .catch((_e) => {
                // most likely file doesn't exist
                // use default theme based on system theme (passed in param)
                console.log("no settings file found");
                this.writeSettingsToJson({theme: theme});
                return theme;
            });
    }

    static async changeTheme(theme: 'light' | 'dark') {
        await this.writeSettingsToJson({theme: theme});
    }

    static async writeSettingsToJson(settings: SettingsObj) {
        await createDir('Database', {dir: BaseDirectory.App, recursive: true})
            .then(() => {
                console.log("create dir success");
                writeTextFile('Database/Settings.json', JSON.stringify(settings),
                    {dir: BaseDirectory.App})
                    .then(() => {
                        console.log('write to settings json success');
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}

export default Settings;
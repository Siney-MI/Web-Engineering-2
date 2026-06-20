[![pipeline status](../../../badges/main/pipeline.svg)](../../../-/pipelines/latest)
[![coverage](../../../badges/main/coverage.svg)](../../../-/pipelines/latest)

# WE 2, Blatt 06

Zur Bearbeitung und Abgabe des Aufgabenblattes gehen Sie wie folgt vor:

1. Erstellen Sie einen Fork des Projekts unter Ihrer Gitlab-Kennung.
2. Setzen Sie die Sichtbarkeit Ihres Forks auf private.
3. Klonen Sie Ihren Fork.
4. Führen Sie `npm install` im Projektverzeichnis aus.
5. Bearbeiten Sie die Aufgabe auf dem Branch "main" (dies ist der Standard, normalerweise sollten Sie mit Branches nichts zu tun haben).
6. 'Committen' Sie alle Ihre Änderungen mindestens nach jeder Teilaufgabe. Geben Sie sinnvolle Commit-Messages an!

Die Tests müssen via `npm test` ausführbar sein. Dies ist initial auch schon so konfiguriert.

Die Pipeline (siehe Badge oben) zeigt Ihnen in Ihrem Gitlab-Fork an, ob Ihr Projekt grundsätzlich für die automatische Korrektur vorbereitet ist. Dazu müssen Sie alle Ihre Änderungen mit `git push` nach Gitlab spielen.

Für die Abgabe erstellen Sie eine Zip-Datei `abgabe-Blatt_06.zip` mittels
```
npm run abgabe
```
Diese enthält Ihr lokales Repository. Diese Datei müssen Sie dann in Moodle hochladen.

Weiteres zur Bearbeitung und Abgabe finden Sie im Blatt "Modalitäten" unter Moodle.

# Hinweise zum Einloggen bei Gitlab und zu Docker und Dev Container

## Token erstellen

Um ein Projekt von Gitlab mit `git clone https://gitlab.bht-berlin.de/...` zu klonen, müssen Sie sich auf Ihrem Rechner bei Gitlab einloggen. Das Gitlab der BHT benötigt dazu eine 2-Faktor-Authentifierung mit einem Token. Das Token müssen Sie unter 
https://gitlab.bht-berlin.de/-/user_settings/personal_access_tokens erstellen, eine Anleitung finden Sie unter im Kursbereich im LMS unter Zusatzmaterial. Falls Sie planen, mit Dev Containern zu arbeiten -- was aus Sicherheitsgründen empfpohlen wird -- beachten Sie bitte, bei dem Access Token `read_registry` zu setzen.

Generell müssen Sie nun auf Ihrem Rechner beim Einloggen statt Ihres Passwort das Token verwenden! Speichern Sie das Token also unbedingt irgendwo sicher ab (am besten in einem Passwort-Manager), da es in Gitlab nur beim ersten Mal angezeigt wird.

## Klonen

Beim ersten Klonen wird git dann nach Ihrem Username und Passwort fragen. Je nach Einstellungen und Betriebssystem kann dabei ein Fenster aufgehen oder Sie müssen die Informationen in der Kommandozeile eingeben. Verwenden Sie **als Passwort nun das Token** und nicht Ihr Gitlab-Passwort!

## Dev Container

Falls Sie Dev Container -- eine Beschreibung finden sie ebenfalls im LMS unter Zusatzmaterial -- verwenden, müssen Sie folgende Dinge beachten:

- Sie müssen Docker installiert haben. Tipps zur Installation finden Sie in der [Dokumentation zu Dev Container](https://code.visualstudio.com/docs/devcontainers/containers#_installation).
- Sie müssen die Extension ['Dev Container'](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) in VS Code installiert haben.

Wenn Sie nun ein Projekt lokal geklont haben und es mit VS Code öffnen, wird VS Code Ihnen unten rechtes ein kleines Fenster anzeigen, dass eine Dev Container-Konfiguration gefunden wurde und ob Sie das Projekt im Dev Container öffnen wollen. Bestätigen Sie dieses. Sie können alternativ das Projekt auch direkt im Dev Container öffnen, wählen Sie dazu in der Command-Palette `Dev Containers: Open Folder Dev Container...` aus.

Beim Starten des Dev Containers wird wieder unten rechts ein Fenster angezeigt, in dem man ein Log öffnen kann. Eventuell ist es sinnvoll, beim ersten Starten dieses Log zu öffnen. Beim ersten Start wird es auf jeden Fall länger dauern, da zunächst das Docker-Image geladen werden muss. Das Image ist mit 1 GByte ziemlich groß, allerdings werden die 1 GByte nur beim ersten Mal geladen. Falls Sie bereits ein ähnliches Image mal in einem anderen Zusammenhang geladen haben, wird auch weniger geladen -- Docker ist da extrem effezient!).

Falls das Starten mit dem Dev Container nicht klappt, kann das daran liegen, dass Sie sich bei der BHT-Gitlab-Docker-Registry (von dort wird das Image geladen) noch anmelden müssen. Gehen Sie dazu einfach irgendwo in den Terminal und geben Sie dort ein:

```bash
docker login registry.bht-berlin.de:443 -u «username» --password-stdin
```

wobei Sie `«username»` durch Ihre Gitlab-Kennung (also die Campus-ID) ersetzen. **Als Passwort geben Sie dann das Token ein** und nicht Ihr eigentliches Passwort!

## Lizenz (License)

Die Dateien dürfen nur im Rahmen der oben genannten Vorlesung verwendet werden und sind nur zum persönlichen Gebrauch bestimmt.
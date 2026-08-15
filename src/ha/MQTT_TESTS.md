# MQTT smoke tests

In Home Assistant go to:

```text
Settings > Devices & services > MQTT > Configure
```

Use **Publish a packet**.

Command topic:

```text
smartcabinet/cabinet01/api/command
```

Listen to:

```text
smartcabinet/cabinet01/#
```

## Cabinet actions

### Power ON

```json
{"action":"setPower","value":true}
```

### Power OFF

```json
{"action":"setPower","value":false}
```

### Brightness 40%

```json
{"action":"setBrightness","value":40}
```

### Highlight shelf 2, location 3

```json
{"action":"highlightLocation","shelf":2,"location":3}
```

## Miniature CRUD

### Create

```json
{
  "action":"createMiniature",
  "name":"Tlaloc",
  "shelf":2,
  "location":3,
  "notes":"Vibrant blue and yellow scheme"
}
```

The result contains the generated ID:

```json
{
  "ok":true,
  "action":"createMiniature",
  "id":"mini-a1b2c3d4"
}
```

### Read all

```json
{"action":"getMiniatures"}
```

Catalogue topic:

```text
smartcabinet/cabinet01/api/miniatures
```

Example:

```json
{
  "count":1,
  "items":[
    {
      "id":"mini-a1b2c3d4",
      "name":"Tlaloc",
      "shelf":2,
      "location":3,
      "notes":"Vibrant blue and yellow scheme"
    }
  ]
}
```

### Read one

```json
{
  "action":"getMiniature",
  "id":"mini-a1b2c3d4"
}
```

Response topic:

```text
smartcabinet/cabinet01/api/miniature
```

### Update

```json
{
  "action":"updateMiniature",
  "id":"mini-a1b2c3d4",
  "name":"Tlaloc",
  "shelf":3,
  "location":1,
  "notes":"Moved to shelf 3"
}
```

### Delete

```json
{
  "action":"deleteMiniature",
  "id":"mini-a1b2c3d4"
}
```

## Other output topics

State:

```text
smartcabinet/cabinet01/api/state
```

Command result:

```text
smartcabinet/cabinet01/api/result
```

Availability:

```text
smartcabinet/cabinet01/availability
```

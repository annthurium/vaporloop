import json

# These constants let us keep track of rows instead of coordinates, which makes rendering easier.
Y_MOD = 150

def GenerateEventSet(asWritten, mainMenu):
    id = asWritten["id"]
    msg = asWritten["msg"]

    gatherer = {
        "name": id,
        "type": "gather-input-on-call",
        "transitions": [{ "event": "speech" }, { "event": "timeout" }, { "event": "keypress",  "next": "split_based_on_" + id}],
        "properties": {
            "speech_timeout": "auto",
            "offset": {
                "x": asWritten["x"],
                "y": asWritten["y"]
            },
            "loop": 1,
            "finish_on_key": "#",
            "say": msg,
            "stop_gather": True,
            "gather_language": "en",
            "profanity_filter": "true",
            "timeout": 5
        }
    }

    splitter = {
        "name": "split_based_on_" + id,
        "type": "split-based-on",
        "properties": {
            "input": "{{widgets." + gatherer["name"] + ".Digits}}",
            "offset": {
                "x": asWritten["x"],
                "y": asWritten["y"] + Y_MOD
            }
        },
        "transitions": [{ "event": "noMatch" }],
    }

    if "transitions" in asWritten:
        i = 1
        for t in asWritten["transitions"]:
            condition = {
                "friendly_name": "If value equal to " + str(i),
                "arguments": [ "{{widgets." + gatherer["name"] + ".Digits}}"],
                "type": "equal_to",
                "value": str(i)
            }

            transition = {
                "next": t,
                "event": "match",
                "conditions": [ condition ]
            }
            i= i + 1
            splitter["transitions"].append(transition)
    
    end = ("end" in asWritten)
    if end:
        condition = {
            "friendly_name": "If value equal to " + str(0),
            "arguments": [ "{{widgets." + gatherer["name"] + ".Digits}}"],
            "type": "equal_to",
            "value": 0
        }

        transition = {
            "next": mainMenu,
            "event": "match",
            "conditions": [ condition ]
        }
        splitter["transitions"].append(transition)
        gatherer["properties"]["say"] = gatherer["properties"]["say"] + " Press 0 to return to the main menu."

    return [gatherer, splitter]


def GenerateEventSpeech(asWritten):
    id = asWritten["id"]
    msg = asWritten["msg"]

    gatherer = {
        "name": id,
        "type": "gather-input-on-call",
        "transitions": [{ "event": "speech", "next": asWritten["speech"] }, { "event": "timeout" }, { "event": "keypress"}],        "properties": {
            "speech_timeout": "auto",
            "offset": {
                "x": asWritten["x"],
                "y": asWritten["y"]
            },
            "loop": 1,
            "finish_on_key": "#",
            "say": msg,
            "stop_gather": True,
            "gather_language": "en",
            "profanity_filter": "true",
            "timeout": 10
        }
    }
    return [gatherer]

def GenerateEventAudio(asWritten):
    props = {
        "play": asWritten["audio"],
        "offset": { "x": asWritten["x"], "y": asWritten["y"]},
        "loop": 1
    }
    event = {
      "name": asWritten["id"],
      "type": "say-play",
      "transitions": [ { "next": asWritten["next"], "event": "audioComplete" } ],
      "properties": props
    }
    return [event]


def GenerateEventSingle(asWritten):
    id = asWritten["id"]
    msg = asWritten["msg"]

    gatherer = {
        "name": id,
        "type": "gather-input-on-call",
        "transitions": [{ "event": "speech" }, { "event": "timeout" }, { "event": "keypress"}],
        "properties": {
            "speech_timeout": "auto",
            "offset": {
                "x": asWritten["x"],
                "y": asWritten["y"]
            },
            "loop": 1,
            "finish_on_key": "#",
            "say": msg,
            "stop_gather": True,
            "gather_language": "en",
            "profanity_filter": "true",
            "timeout": 5
        }
    }
    return [gatherer]

def GenerateSequence(asWritten):
    msgs = asWritten["sequence"]
    states = []
    i = 0
    ffs = []

    for m in msgs:
        id = asWritten["id"] + "_" + str(i)
        y = asWritten["y"] + (i * Y_MOD * 2.5)
        x = asWritten["x"]
        msg = m + " Press 1 to continue."
        next_state = asWritten["id"] + "_" + str(i + 1)
        if i == (len(msgs) - 1):
            next_state = asWritten["next"]
        f = {
            "id": id,
            "msg": msg,
            "x": x,
            "y": y,
            "transitions": [next_state]
        }
        ffs.append(f)
        states.extend(GenerateEventSet(f, id + "_0"))
        i = i+1

  #  print json.dumps(ffs, indent=4)
    return states

def GeneratePlay(asWritten):
    id = asWritten["id"]
    url = asWritten["url"]

    state = {
        "name": id,
        "type": "say-play",
        "transitions": [ { "next": "return_to_main_menu", "event": "audioComplete" } ],
        "properties": {
            "play": url,
            "offset": {
                "x": asWritten["x"],
                "y": asWritten["y"]
            },
            "loop": 1
        }
    }

    return [state]

def GenerateFlow(states, y):
    flow =  {
        "description": "VaporPhone",
        "states": [{
            "name": "Trigger",
            "type": "trigger",
            "transitions": [ { "event": "incomingMessage" }, { "next": states[0]["name"],  "event": "incomingCall" }, { "event": "incomingRequest" }
            ],
            "properties": {
                "offset": {
                    "x": 0,
                    "y": y
                }
            }
        }]
    }
    flow["states"].extend(states)
    return flow


def GenerateStates(f, mainMenu):
    if ("transitions" in f) or ("end" in f):
        return GenerateEventSet(f, mainMenu)
    elif "speech" in f:
        return GenerateEventSpeech(f)
    elif "audio" in f:       # Didn't realize when I first wrote this that there are intermediate audio events, too lazy to fix
        return GenerateEventAudio(f)
    elif "url" in f:
        return GeneratePlay(f)
    elif "sequence" in f:
        return GenerateSequence(f)
    else:
        return GenerateEventSingle(f)
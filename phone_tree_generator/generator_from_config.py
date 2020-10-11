import json
import generate_event

# These constants let us keep track of rows instead of coordinates, which makes rendering easier.
Y_CONST = 400
X_CONST = 300

# Generate states using these constants
def getStates(f, x):
    f["x"] = (f["x"] + x)  * X_CONST
    f["y"] = f["y"] * Y_CONST
    # Generate states. The stupid bonus parameter is the main menu event.
    return generate_event.GenerateStates(f, "main_menu") 

# Infrastructure for loading config files
states = []
def load(filename):
  with open(filename) as f:
    data = json.load(f)
    for s in data["states"]:
      states.extend(getStates(s, data["x-offset"]))


# Load all our config files. This should be a config file!
load("main_menu.json")
load("pigeon.json")
load("aol.json")
load("dystopia_meta.json")

#load("yoga.json")
#load("dance.json")
#load("dream.json")


# Generate the flow. The stupid bonus parameter is the top-most y-coordinate for the "trigger" event
print json.dumps(generate_event.GenerateFlow(states, -2 * Y_CONST), indent=4)
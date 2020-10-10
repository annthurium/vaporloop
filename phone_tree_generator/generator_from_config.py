import json
import generate_event

# These constants let us keep track of rows instead of coordinates, which makes rendering easier.
Y_CONST = 400
X_CONST = 300
# Generate states using these constants
def getStates(f):
    f["x"] = f["x"] * X_CONST
    f["y"] = f["y"] * Y_CONST
    # Generate states. The stupid bonus parameter is the main menu event.
    return generate_event.GenerateStates(f, "main_menu") 


# Load all our config files. This should be a config file!
with open('main_menu.json') as f:
  mainmenu = json.load(f)
with open('pigeon.json') as f:
  pigeon = json.load(f)


### XXX: what to do with the "end" and how to hardcode that in
states = []

for f in mainmenu:
    states.extend(getStates(f))

for f in pigeon:
    states.extend(getStates(f))

# Generate the flow. The stupid bonus parameter is the top-most y-coordinate for the "trigger" event
print json.dumps(generate_event.GenerateFlow(states, -2 * Y_CONST), indent=4)
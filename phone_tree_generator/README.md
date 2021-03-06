## Phone Tree Generator

This uses JSON configuration files to generate a phone tree to use in Twillio Studio.

For information on Twillio Studio, check out this helpful FAQ: https://www.twilio.com/docs/studio/user-guide

Learn how to set one up, and connect it to a phone number on your own. If you get tired of creating widgets manually, you
can use this generator.

To upload the JSON once it is generated, use this:

In particular, you may want to read: https://www.twilio.com/docs/studio/user-guide#importing-flow-data

Helpful note: you don't have to create a new flow each time. The flow JSON linked here (https://www.twilio.com/docs/studio/user-guide#exporting-flow-data) is editable, so you can just replace that with your custom JSON generated by this script.

## Creating Configuration Files

You can have infinite configuration files. Each file consists of states and an x-offset.

`x-offset`: This specifies how far on the x-access to move out everything in this tree. Helpful for rendering. Pretend that this number is added to every x-corrdinate in a state below.

`states`: This is the bulk of what you are doing. Each state specifies a widget in the final flow. States contain a `msg` (what the voice says), `x` and `y` (coordinates of where to render it on the flow board). The coordinates on the state are small numbers that are multiplied by a constant in the code to make the rendering actually work, see examples.

*Documenting the details is a lot of work, so please use the files in this directory as examples right now*

### Types of states

`transitions`: States that have transitions offer choices, in order, starting with 1. For example, see the menu state. Transitions refer to theID of the state that you would go to if you press that number.
`speech`: These states often end with "I will wait" and go to the next state automatically after a certain time (unless the user starts talking)
`sequence`: Present these messages as a series of states, each of which will end with "\n\n Press 1 to continue".
`audio`: Play this audio file, then go to the `next` state.
`url`: Play this URL, then end the phone tree.

### Other Useful Configu Options
`end`: States that are marked as an `end` state offer the option to go back to the main menu if `0` is pressed.


## Running the Generator

Once you create your configuration files, you want to edit the `generate_from_config.py` script to include them and not include our files.

Specifically, you want to edit this section. Remove loading all of Vaporloop content and load your own.


```
# Load all our config files. This should be a config file!
load("main_menu.json")
load("pigeon.json")
load("aol.json")

load("yoga.json")
load("dance.json")
load("dream.json")

load("dystopia_meta.json")
load("dystopia_wealth.json")
load("dystopia_animal.json")
load("dolphin.json")
load("raccoon.json")
load("trex.json")

load("dystopia_gender.json")
```

If you are feeling cool, you also want to change the `generate_event.py` file to not call your flow "VaporPhone", but that doesn't really matter.

Once done, run with:

`python generate_from_config.py`

If you want everything in a file, such as `complete_flow.json`, run:

`python generate_from_config.py > complete_flow.json`

Copy the contents of `complete_flow.json` and paste them into the box described in https://www.twilio.com/docs/studio/user-guide#importing-flow-data (if you are creating a tree from scratch) or the box described in https://www.twilio.com/docs/studio/user-guide#exporting-flow-data if you are editing an existing flow.

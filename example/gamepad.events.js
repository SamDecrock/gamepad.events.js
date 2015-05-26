window.GamepadEvents = {};


GamepadEvents.Button = Backbone.Model.extend({
});

GamepadEvents.Buttons = Backbone.Collection.extend({
	model : GamepadEvents.Button,
});

GamepadEvents.Axis = Backbone.Model.extend({
});

GamepadEvents.Axes = Backbone.Collection.extend({
	model : GamepadEvents.Axis,
});

GamepadEvents.Gamepad = Backbone.Model.extend({
	timestamp: 0,

	// types of gamepads
	// ------------------
	// nr | Firefox id:                              | Chrome id                                                                     | brand name                    | notes
	// ---| -----------------------------------------| ----------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------
	// 1  | "81f-e401-USB gamepad           "        | "USB gamepad            (Vendor: 081f Product: e401)"                         | NES (Nintendo) USB controller | uses axes for left/right/up/down
	// 2  | "46d-c219-Logitech Cordless RumblePad 2" | "Logitech Cordless RumblePad 2 (STANDARD GAMEPAD Vendor: 046d Product: c219)" | Logitech Cordless RumblePad 2 | Playstation like controller; 1/2/3/4 buttons are mapped as playstation buttons square/X/O/triangle
	// 3  | "e8f-3-USB Joystick     "                | "USB Joystick      (STANDARD GAMEPAD Vendor: 0e8f Product: 0003)"             | König Gaming PC Control Pad   | Playstation like controller; 1/3/4/2 buttons are mapped as playstation buttons square/X/O/triangle
	// 4  | "54c-268-PLAYSTATION(R)3 Controller"     | "PLAYSTATION(R)3 Controller (STANDARD GAMEPAD Vendor: 054c Product: 0268)"    | PlayStation 3 Dualshock 3 Wireless Controller


	initialize: function (options) {
		switch(this.get('type')) {
			// NES gampads:
			case "81f-e401-USB gamepad           ":                     // gamepad 1 in Firefox
			case "USB gamepad            (Vendor: 081f Product: e401)": // gamepad 1 in Chrome
			this.set({
				button_select  : 'released',
				button_start   : 'released',
				button_B       : 'released',
				button_A       : 'released',
				button_up      : 'released',
				button_down    : 'released',
				button_left    : 'released',
				button_right   : 'released',
			});
			break;

			// OTHERS (Playstation like gamepads)
			default:
			this.set({
				button_select  : 'released',
				button_start   : 'released',
				button_square  : 'released',
				button_X       : 'released',
				button_O       : 'released',
				button_triangle: 'released',
				button_up      : 'released',
				button_down    : 'released',
				button_left    : 'released',
				button_right   : 'released',
				button_L1      : 'released',
				button_L2      : 'released',
				button_R1      : 'released',
				button_R2      : 'released',
				leftstick_x    : 0,
				leftstick_y    : 0,
				rightstick_x   : 0,
				rightstick_y   : 0
			});
			break;
		}

		// attach listeners to buttons/exis changes:
		this.get('buttons').on('change', this.button_changed, this);
		this.get('axes').on('change', this.axis_changed, this);
	},

	button_changed: function (button) {
		var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

		switch(this.get('type')) {
			// only check for non-PS3 mapped gampads:
			case "81f-e401-USB gamepad           ":                                 // gamepad 1 in Firefox
			case "USB gamepad            (Vendor: 081f Product: e401)":             // gamepad 1 in Chrome
			this.NESPAD_button_changed(button);
			break;

			case "46d-c219-Logitech Cordless RumblePad 2":                          // gamepad 2 in Firefox
			this.Logitech_Firefox_button_changed(button);
			break;

			case "USB Joystick      (STANDARD GAMEPAD Vendor: 0e8f Product: 0003)": // gamepad 3 in Chrome
			this.Konig_Chrome_button_changed(button);
			break;

			case "e8f-3-USB Joystick     ":                                         // gamepad 3 in Firefox
			this.Konig_Firefox_button_changed(button);
			break;


			// PS3-mapped gamepads:
			default:
			if(isFirefox)
				this.PS3_Firefox_button_changed(button);
			else
				this.PS3_Chrome_button_changed(button);
			break;
		}
	},

	axis_changed: function (axis) {
		var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

		switch(this.get('type')) {
			// Some gampads seem to use the Axes when the up/down/left/right buttons are pressed
			// This is always the case with the NES gamepads (in Chrome and in Firefox)
			// This is sometimes the case with others, but only in Firefox
			// In Chrome, regular buttons are always mapped to the up/down/left/right buttons

			case "81f-e401-USB gamepad           ":                                            // gamepad 1 (NES) in Firefox
			case "USB gamepad            (Vendor: 081f Product: e401)":                        // gamepad 1 (NES) in Chrome
			case "46d-c219-Logitech Cordless RumblePad 2":                                     // gamepad 2 (Logitech) in Firefox
			case "e8f-3-USB Joystick     ":                                                    // gamepad 3 (König) in Firefox
			this.axis2upDownLeftRight(axis);
			break;
		}


		// map sticks:
		if(this.get('type') == "81f-e401-USB gamepad           ") return;                      // gamepad 1 doesnt have sticks
		if(this.get('type') == "USB gamepad            (Vendor: 081f Product: e401)") return;  // gamepad 1 doesnt have sticks

		switch(axis.get('id')){
			case 0:
			this.set('leftstick_x', axis.get('value'));
			break;

			case 1:
			this.set('leftstick_y', axis.get('value'));
			break;

			case 2:
			this.set('rightstick_x', axis.get('value'));
			break;

			case 3:
			this.set('rightstick_y', axis.get('value'));
			break;
		}


	},

	axis2upDownLeftRight: function (axis) {
		var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

		// In Firefox, axis 2 and 1 are used for up/down and left/right
		// In Chrome,  axis 1 and 0 are used for up/down and left/right (Note that only the NES gamepads use this kind of mapping in Chrome)
		// The axis values are always someting like -0.99 and +0.99. So I'm rounding them here:


		// left and right axis:
		if( (isFirefox && axis.get('id') == 2) || (!isFirefox && axis.get('id') == 1) ) {

			switch(Math.round(axis.get('value'))) {
				case -1: //up pressed, down is automatically released:
				this.set('button_up', 'pressed');
				this.set('button_down', 'released');
				break;

				case 1: //down pressed, up is automatically released:
				this.set('button_down', 'pressed');
				this.set('button_up', 'released');
				break;

				default:
				this.set('button_up', 'released');
				this.set('button_down', 'released');
			}
		}

		// up and down axis:
		if( (isFirefox && axis.get('id') == 1) || (!isFirefox && axis.get('id') == 0) ) {

			switch(Math.round(axis.get('value'))) {
				case -1: //left pressed, right is automatically released:
				this.set('button_left', 'pressed');
				this.set('button_right', 'released');
				break;

				case 1: //right pressed, left is automatically released:
				this.set('button_right', 'pressed');
				this.set('button_left', 'released');
				break;

				default:
				this.set('button_left', 'released');
				this.set('button_right', 'released');
			}
		}
	},

	NESPAD_button_changed: function (button) {
		switch(button.id) {
			case 8:
			this.set('button_select', button.get('value')?'pressed':'released');
			break;

			case 9:
			this.set('button_start', button.get('value')?'pressed':'released');
			break;

			case 0:
			this.set('button_B', button.get('value')?'pressed':'released');
			break;

			case 1:
			this.set('button_A', button.get('value')?'pressed':'released');
			break;
		}
	},

	Logitech_Firefox_button_changed: function (button) {
		switch(button.id) {
			case 8:
			this.set('button_select', button.get('value')?'pressed':'released');
			break;

			case 9:
			this.set('button_start', button.get('value')?'pressed':'released');
			break;

			case 0:
			this.set('button_square', button.get('value')?'pressed':'released');
			break;

			case 1:
			this.set('button_X', button.get('value')?'pressed':'released');
			break;

			case 2:
			this.set('button_O', button.get('value')?'pressed':'released');
			break;

			case 3:
			this.set('button_triangle', button.get('value')?'pressed':'released');
			break;


			case 4:
			this.set('button_L1', button.get('value')?'pressed':'released');
			break;

			case 6:
			this.set('button_L2', button.get('value')?'pressed':'released');
			break;

			case 5:
			this.set('button_R1', button.get('value')?'pressed':'released');
			break;

			case 7:
			this.set('button_R2', button.get('value')?'pressed':'released');
			break;


			case 12:
			case 13:
			case 14:
			case 15:
			this.standardUpDownLeftRight_buttons_changed(button);
			break;
		}
	},

	Konig_Chrome_button_changed: function (button) {
		switch(button.id) {
			case 10:
			this.set('button_select', button.get('value')?'pressed':'released');
			break;

			case 11:
			this.set('button_start', button.get('value')?'pressed':'released');
			break;

			case 3:
			this.set('button_square', button.get('value')?'pressed':'released');
			break;

			case 0:
			this.set('button_X', button.get('value')?'pressed':'released');
			break;

			case 2:
			this.set('button_O', button.get('value')?'pressed':'released');
			break;

			case 1:
			this.set('button_triangle', button.get('value')?'pressed':'released');
			break;


			case 6:
			this.set('button_L1', button.get('value')?'pressed':'released');
			break;

			case 4:
			this.set('button_L2', button.get('value')?'pressed':'released');
			break;

			case 7:
			this.set('button_R1', button.get('value')?'pressed':'released');
			break;

			case 5:
			this.set('button_R2', button.get('value')?'pressed':'released');
			break;


			case 12:
			case 13:
			case 14:
			case 15:
			this.standardUpDownLeftRight_buttons_changed(button);
			break;
		}
	},

	Konig_Firefox_button_changed: function (button) {
		switch(button.id) {
			case 10:
			this.set('button_select', button.get('value')?'pressed':'released');
			break;

			case 11:
			this.set('button_start', button.get('value')?'pressed':'released');
			break;

			case 0:
			this.set('button_square', button.get('value')?'pressed':'released');
			break;

			case 2:
			this.set('button_X', button.get('value')?'pressed':'released');
			break;

			case 3:
			this.set('button_O', button.get('value')?'pressed':'released');
			break;

			case 1:
			this.set('button_triangle', button.get('value')?'pressed':'released');
			break;


			case 4:
			this.set('button_L1', button.get('value')?'pressed':'released');
			break;

			case 6:
			this.set('button_L2', button.get('value')?'pressed':'released');
			break;

			case 5:
			this.set('button_R1', button.get('value')?'pressed':'released');
			break;

			case 7:
			this.set('button_R2', button.get('value')?'pressed':'released');
			break;


			case 12:
			case 13:
			case 14:
			case 15:
			this.standardUpDownLeftRight_buttons_changed(button);
			break;
		}
	},


	PS3_Chrome_button_changed: function (button) {
		switch(button.id) {
			case 8:
			this.set('button_select', button.get('value')?'pressed':'released');
			break;

			case 9:
			this.set('button_start', button.get('value')?'pressed':'released');
			break;

			case 2:
			this.set('button_square', button.get('value')?'pressed':'released');
			break;

			case 0:
			this.set('button_X', button.get('value')?'pressed':'released');
			break;

			case 1:
			this.set('button_O', button.get('value')?'pressed':'released');
			break;

			case 3:
			this.set('button_triangle', button.get('value')?'pressed':'released');
			break;


			case 4:
			this.set('button_L1', button.get('value')?'pressed':'released');
			break;

			case 6:
			this.set('button_L2', button.get('value')?'pressed':'released');
			break;

			case 5:
			this.set('button_R1', button.get('value')?'pressed':'released');
			break;

			case 7:
			this.set('button_R2', button.get('value')?'pressed':'released');
			break;


			case 12:
			case 13:
			case 14:
			case 15:
			this.standardUpDownLeftRight_buttons_changed(button);
			break;
		}
	},

	PS3_Firefox_button_changed: function (button) {
		switch(button.id) {
			case 0:
			this.set('button_select', button.get('value')?'pressed':'released');
			break;

			case 3:
			this.set('button_start', button.get('value')?'pressed':'released');
			break;

			case 15:
			this.set('button_square', button.get('value')?'pressed':'released');
			break;

			case 14:
			this.set('button_X', button.get('value')?'pressed':'released');
			break;

			case 13:
			this.set('button_O', button.get('value')?'pressed':'released');
			break;

			case 12:
			this.set('button_triangle', button.get('value')?'pressed':'released');
			break;


			case 10:
			this.set('button_L1', button.get('value')?'pressed':'released');
			break;

			case 8:
			this.set('button_L2', button.get('value')?'pressed':'released');
			break;

			case 11:
			this.set('button_R1', button.get('value')?'pressed':'released');
			break;

			case 9:
			this.set('button_R2', button.get('value')?'pressed':'released');
			break;


			case 4:
			this.set('button_up', button.get('value')?'pressed':'released');
			break;

			case 6:
			this.set('button_down', button.get('value')?'pressed':'released');
			break;

			case 7:
			this.set('button_left', button.get('value')?'pressed':'released');
			break;

			case 5:
			this.set('button_right', button.get('value')?'pressed':'released');
			break;
		}
	},


	standardUpDownLeftRight_buttons_changed: function (button) {
		// up/down/left/right (only on Chrome):
		switch(button.id) {
			case 12:
			this.set('button_up', button.get('value')?'pressed':'released');
			break;

			case 13:
			this.set('button_down', button.get('value')?'pressed':'released');
			break;

			case 14:
			this.set('button_left', button.get('value')?'pressed':'released');
			break;

			case 15:
			this.set('button_right', button.get('value')?'pressed':'released');
			break;
		}
	}
});


GamepadEvents.Gamepads = Backbone.Collection.extend({
	model : GamepadEvents.Gamepad,

	polling: false,

	scan: function () {
		// check if gamepads are already connected:
		var gamepads = navigator.getGamepads();
		for (var i = 0; i < gamepads.length; i++) {
			if(gamepads[i]){
				this.onGamepadConnect(gamepads[i]);
			}
		};

		// listen for new gamepads:
		var self = this;
		window.addEventListener("gamepadconnected", function (event) {
			self.onGamepadConnect.call(self, event.gamepad);
		});

		// listen for disconnected gamepads:
		window.addEventListener("gamepaddisconnected", function (event) {
			self.onGamepadDisconnect.call(self, event.gamepad);
		});
	},


	onGamepadConnect: function (gamepad) {
		// transform buttons into collection of Buttons:
		var buttonsCollection = new GamepadEvents.Buttons();
		for (var i = 0; i < gamepad.buttons.length; i++) {
			var button = gamepad.buttons[i];
			button.id = i;
			buttonsCollection.add(button);
		};

		// transform axes into collection of Axes:
		var axesCollection = new GamepadEvents.Axes();
		for (var i = 0; i < gamepad.axes.length; i++) {
			var axisValue = gamepad.axes[i];
			axesCollection.add({id: i, value: axisValue});
		};

		// build Gamepad model:
		var gamepadModel = new GamepadEvents.Gamepad({
			id: gamepad.index, // use index as id (this is unique)
			type: gamepad.id,  // gamepad.id is not unique when to types of the same gamepads are connected
			mapping: gamepad.mapping,
			connected: gamepad.connected,
			buttons: buttonsCollection,
			axes: axesCollection
		});
		gamepadModel.timestamp = gamepad.timestamp; // set as a variable of the model (not as a backbone attribute), we don't want it to clutter the events

		// add it to the collection fo gamepad Models;
		this.add(gamepadModel);


		// start polling if not already polling:
		if(!this.polling) {
			this.polling = true;
			var self = this;
			window.requestAnimationFrame(function () {
				self.pollGamepads.call(self);
			});
		}
	},

	pollGamepads: function () {
		var gamepads = navigator.getGamepads();
		for (var i = gamepads.length - 1; i >= 0; i--) {
			if(!gamepads[i]) continue;
			var gamepad = gamepads[i];

			// get model based on id (gamepad index):
			var gamepadModel = this.get(gamepad.index);
			if(!gamepadModel) continue;

			if(gamepadModel.timestamp != gamepad.timestamp) {
				this.onGamepadUpdate(gamepadModel, gamepad);
				gamepadModel.timestamp = gamepad.timestamp;
			}
		};


		if(this.polling) {
			var self = this;
			window.requestAnimationFrame(function () {
				self.pollGamepads.call(self);
			});
		}
	},

	onGamepadUpdate: function (gamepadModel, gamepad) {
		// update button models:
		for (var i = 0; i < gamepad.buttons.length; i++) {
			var id = i;
			var buttonModel = gamepadModel.get('buttons').get(id);
			buttonModel.set(gamepad.buttons[i]);
		};

		// update axis models:
		for (var i = 0; i < gamepad.axes.length; i++) {
			var id = i;
			var axisModel = gamepadModel.get('axes').get(id);
			axisModel.set({value: gamepad.axes[i]});
		};

		// update the rest of the gamepad model:
		gamepadModel.set({
			mapping: gamepad.mapping,
			connected: gamepad.connected
		});
	},

	onGamepadDisconnect: function (gamepad) {
		var gamepadModel = this.get(gamepad.index);
		if(!gamepadModel) return;

		gamepadModel.set({
			connected: false
		});
	}
});


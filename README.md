# gamepad.events.js
Easy gamepad events in the browser. This script adds eventing to the Gamepad API and maps the raw button and axis events to known buttons.

Gamepad buttons differ from gamepad to gamepad. This script tries to bring to some order to that mess.

gampad.events.js uses [Backbone.js's](http://backbonejs.org/) event model.

It has been tested on Firefox and Chrome!

## Changes you can listen to

A button is either 'released' or 'pressed'

### On a Nintendo USB Controller

    button_select 
    button_start  
    button_B      
    button_A      
    button_up     
    button_down   
    button_left   
    button_right  

### On a regular Playstation like controller

    button_select  
    button_start   
    button_square  
    button_X       
    button_O       
    button_triangle
    button_up      
    button_down    
    button_left    
    button_right   
    button_L1      
    button_L2      
    button_R1      
    button_R2      

## Setup

Don't forget to include Backbone, Underscore and jQuery in your html header:

    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.0/backbone-min.js"></script>

Include the [backbone.events.js](https://raw.githubusercontent.com/SamDecrock/gamepad.events.js/master/example/gamepad.events.js) script:

    <script type="text/javascript" src="gamepad.events.js"></script>

## How to use

Initialize a Backbone Collection of gamepads with:
    
    var gamepads = new Gamepadevents.Gamepads();


Set up listeners for new Gamepads:

    gamepads.on('add', function (gamepad, collection) {
        // do stuff with the gamepad model
    });

Start looking for gamepads:

    gamepads.scan();

Set up listeners for a change in a Gamepad:

    gamepads.on('add', function (gamepad, collection) {
        gamepad.on('change:button_start', function (gamepad, button_start) {
            if(button_start == 'pressed')
                console.log('You pressed the start button on gamepad ' + gamepad.id);
            else
                console.log('You released the start button of gamepad ' + gamepad.id);
        });
    });


Or listen to all changes:

    gamepads.on('add', function (gamepad, collection) {
        gamepad.on('change', function (gamepad) {
            console.log('gamepad with id ' + gamepad.id + ' changed:', gamepad.changed);
        });
    });


See example.html for more examples.

## Supported gamepads
* The [Logitech Cordless RumblePad 2](http://support.logitech.com/product/cordless-rumblepad-2)
* The König Gaming PC Control Pad
* The [NES Nintendo USB Controller](http://www.ebay.com/itm/Classic-Gaming-Controller-Joypad-Gamepad-For-Nintendo-NES-Windows-PC-MAC-EC-/321649413037?ssPageName=ADME:L:OU:BE:3160)

Feel free to clone and add support for other controllers




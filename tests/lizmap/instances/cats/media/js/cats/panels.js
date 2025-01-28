// Javascript file to hide buttons which are not necessary for the demonstration
// or to activate a key feature by default in the project
lizMap.events.on({
    'uicreated': function(evt){
        $('#button-permaLink').hide();
        $('#button-atlas').click();
    }
});

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Client = (function () {
    var queue   = [];
    var tags    = {};
    var rulers  = {};

    document.addEventListener('DOMContentLoaded', domReady );

    function domReady() {
        // 1. Capture all boxes to objects
        var a = document.querySelectorAll( '[data-playelephant-object]' );
        for( var i=a.length; i--; ) {
            var name = a[i].dataset['playelephantObject'];
            if( rulers[name] )
                rulers[name]( a[i] );
        }
        // Check if document comes to loading state after require
        if( document.readyState==='loading' ) return;
        if( queue.length )
            exec(queue);
        queue = [];
    }

    function listen( tag, func ) {
        tags[tag] = func;
    }

    function push(data) {
        if( !Array.isArray(data) ) {
            data = JSON.parse(data);
        }
        if( document.readyState === 'loading' ) {
            queue.push(data);
            return;
        }
        if( queue.length ) {
            exec(queue);
            queue = [];
        }
        exec(data);
    }

    function exec(data) {
        for (var i = 0; i < data.length; i++) {
            var el = data[i];
            if( Array.isArray(el[0]) ) {
                exec(el);
            } else {
                var fn = tags[el[0]];
                if( fn )
                    fn(el[1]);
            }
        }
    }

    tags['fill'] = function (data) {
        var a = document.querySelectorAll(data['select']);
        for (var i = 0; i < a.length; i++) {
            a[i].innerHTML = data['data'];
        }
    };

    tags['me'] = function (data) {
        var me = document.querySelector('#mine');
        if( !me )
            return;
        var o = me.querySelector('img');
        if( o )
            o.src = data['img'];
        var o = me.querySelector('a');
        if( o ) {
            o.textContent = data['name'];
            o.href = "//user/?" + data['uin'];
        }
    };

    function toserver( request ) {
        XMLHttpRequest
    }

    return {
        push: push,
        listen: listen,
        setObject: function( name, constructor ) {
            rulers[name] = constructor;
        }
    };
}());

function createelement( classname, tag ) {
    var o = document.createElement( tag || 'div' );
    o.className = classname;
    return o;
}

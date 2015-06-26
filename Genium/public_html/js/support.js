/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global phrases_str, decodeURIComponent, phrases, Core */
/** @define {number} */
/* 0- nodebug, 1- logging, 2- debug actions (only for testing!) */
var DEBUG = 2;

var startTime   = Date.now();

var href = window.location.href;
var localfile = href.indexOf( '192.168' )>=0 || href.indexOf( 'localhost' )>=0;
var LOCALTEST = localfile || window.location.href.indexOf('local')>=0;
var Global = {};
var historyStr = '';

var log = function( str, param ) {
    var t = Date.now()-startTime;
    var ts = Math.floor( t/1000/60 ) + ':' + Math.floor( t/1000 )%60 + ':' + (t%1000);
    if( param==='fromserver' ) {
        historyStr += str + '\n';
        if( DEBUG ) console.log( ts + ' ' + str );
    }
    else {
        if( param==='toserver' )
            historyStr += '<send>' + str + '</send>\n';
        else
            historyStr += '<i ' + ts + '>' + str + '</i>\n';
        if( DEBUG ) console.log( ts + ' ' + (param==='toserver'?'>>':'') + str );
    }

    if( historyStr.length>100*1024 ) historyStr = historyStr.slice( /*historyStr.length*/-100*1024 );
};

var isChildOf = function( test, parent ) {
	for( ; test; test=test.parentNode )
            if( test===parent ) return true;
	return false;
};

//-------------------------
var $ = function( id ) {
    return document.getElementById( id );
};

function createcustom( ar ) {
	var o = document.createElement( 'div' );
	for( var k in ar )
		o[k] = ar[k];
	return o;
}

function createblock( classname, subelems ) {
    var o = createelement( classname );
    var p = { o_panel: o };
//    o.s_object = p;
    for( var i=0; i<subelems.length; i++ ) {
        var e = createelement( classname + '_' + subelems[i] );
        p['o_' + subelems[i]] = e;
        o.appendChild( e );
    }
    return p;
}

function createelement( classname, tag ) {
	var o = document.createElement( tag || 'div' );
	o.className = classname;
	return o;
}

function createelementid( id, classname, tag ) {
	var o = document.createElement( tag || 'div' );
	if( id ) o.id = id;
	if( classname ) o.className = classname;
	return o;
}

function createmybutton( classname, content, handler, id ) {
	return createmycontrol( 'mybutton ' + (classname || ''), content, handler, id );
}

function createmycontrol( classname, content, handler, id ) {
	var o = createelement( classname );
	if( content ) o.textContent = Translate( content );
	o.myhandler = handler;
	if( id ) o.id = id;
	return o;
}

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

// Language support. Need one file with phrases string (like ru.js)
var Phrases = {}, unknownphrases = {};

function preparePhrases( o ) {
    // Prepare language strings
    Phrases = o;
    for( var k in Phrases ) {
        var v = Phrases[k];
        if( k[0]>='A' && k[0]<='Z' ) {
            var sl = k.toLowerCase();
            if( !Phrases[sl] ) Phrases[sl] = v.toLowerCase();
        } else if( k[0]>='a' && k[0]<='z' ) {
            var sl = k[0].toUpperCase() + k.slice( 1 );
            if( !Phrases[sl] ) Phrases[sl] = v[0].toUpperCase()+v.slice(1);
        }
    }
}

function Capitalize( str ) {
    return str[0] + str.slice(1).toLowerCase();
}

function getPhrase( str ) {
    return Phrases[str] || str;
}

function shortPhrase( str ) {
    return Phrases[str+'_'] || Phrases[str] || str;
}

var Translate = function( str ) {
    if( !str ) return '';
    if( Phrases.length===0 ) return str;
    function replacer( s, p1, p2 ) {
        if( Phrases[p1] ) return Phrases[p1];
        // Фраза не найдена
        if( p1[0]>='A' && p1[0]<='Z' ) {
            var sl = p1.toLowerCase();
            if( Phrases[sl] ) {
                Phrases[p1] = Capitalize( Phrases[sl] );
                return Phrases[p1];
            }
        }
        if( !unknownphrases[p1] ) {
            unknownphrases[p1] = true;
            if( !LOCALTEST ) {
                var xhr = new XMLHttpRequest();
                var peturl = 'https://www.playelephant.com';
                xhr.open( 'GET', peturl + '/scripts/unknownphrase?phrase='+p1, true );
//		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
                xhr.send( null );
            }
        }
        return Phrases[p1] || s;
    }
    return str.replace( /\{(.*?)\}/g, replacer );
};

function createDragMaster( core ) {
/*	if( window.HTML5DRAGDROP && createDragMaster_new )
		return createDragMaster_new( core )
	else */
		return createDragMaster_old( core );
}

var setTranslatePosition = function ( o, x, y ) {
	setStyleTranslate( o, x, y );
	if( !o.myTrans ) o.myTrans = {};
	o.myTrans.x = x;
	o.myTrans.y = y;
};

var _transformstylename;
var setStyleTranslate = function( o, p, y ) {
	if( !_transformstylename ) _transformstylename = ('transform' in document.body.style)? 'transform' : 'webkitTransform';
//	_transformstylename = 'transform'
	var t = null;
	if( p ) {
		if( p.x )
			t = 'translate3d(' + p.x + 'px,' + p.y + 'px,0)';
		else {
			t = 'translate3d(' + p + 'px,' + y + 'px,0)';
		}
	}
	o.style[_transformstylename] = t;
};

var getTimerStr = function( v ) {
    if( v<0 ) v = 0;
    var s = v%60;
    var m = (v-s)/60, mm = m%60;
    var h = (m-mm)/60;
    if( mm<10 ) mm = '0' + mm;
    if( s<10 ) s = '0' + s;
    str = (h? h+':' : '') + mm + ':' + s;
    return str;
};

var hashCode = function( str ) {
  var hash = 0;
  for( var i=str.length; i--; ) {
      hash = ((hash<<5)-hash)+str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

( function init_anything() {
    // fill URL parameters
    Global.URLparams = {};
    decodeURIComponent( window.location.search.substr(1) ).split( '&' ).forEach(
            function(b) {
                    var a = b.split( '=' );
                    if( !a[1] ) return;
                    Global.URLparams[a[0]] = a[1].replace( '+', ' ' );
            } );
    if( window.UserSid ) Global.URLparams['sid'] = window.UserSid;

    window.HTML5DRAGDROP = false; // ('draggable' in Panel) || ('ondragstart' in Panel && 'ondrop' in Panel)
    log( 'HTML5/Drag&Drop ' + (HTML5DRAGDROP? 'YES' : 'no') );
}());

Core.require( Core.lang );


var b_release_mode = false;
var Style_Domain = "http://localhost:8080/";

function add_js_scripts(s_elt) {
    var tag_hdr = document.getElementsByTagName(s_elt)[0];
    for (var i = 1; i < arguments.length; ++i) {
        var tag_script = document.createElement('script');
        tag_script.setAttribute('type', 'text/javascript');
        tag_script.setAttribute('src',Style_Domain + arguments[i] + "?svn=224");
        tag_hdr.appendChild(tag_script);
    }
};

add_js_scripts('head',
    'js/index.js',
    'js/main.js',
);


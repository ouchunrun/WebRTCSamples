/*****************************************************************************************************************/
/*****************************************************************************************************************/
/*****************************************************************************************************************/

function tsk_ragel_state_create() {
    var self = new Object();
    tsk_ragel_state_init(self, null, 0);
    return self;
}

function tsk_ragel_state_init(o_self, o_data, i_size) {
    o_self.i_cs = 0;
    o_self.i_p = 0;
    o_self.i_pe = i_size;
    o_self.o_data = o_data;
    o_self.s_data = null;
    o_self.i_eof = 0;
    o_self.i_tag_start = 0;
    o_self.i_tag_end = i_size;
}

function tsk_ragel_state_init_ai(o_self, ai_data) {
    return tsk_ragel_state_init_str(o_self, tsk_buff_ab2str(ai_data));
}

function tsk_ragel_state_init_str(o_self, s_str) {
    tsk_ragel_state_init(o_self, tsk_buff_str2ib(s_str), s_str.length);
    o_self.s_data = s_str;
}

function tsk_buff_str2ib(s_str) {
    if (!s_str) {
        console.error("Invalid argument");
        return -1;
    }
    var len = s_str.length;
    var ib = new Array(len);
    for (var i = 0; i < len; ++i) {
        ib[i] = s_str.charCodeAt(i);
    }
    return ib;
}

function tsk_buff_ab2str(buff) {
    return tsk_buff_u8b2ascii(new Uint8Array(buff));
}

function tsk_buff_u8b2ascii(au8_buff) {
    // return Array.prototype.slice.call(au8_buff).join("");
    var str = new String();
    var i_length = au8_buff.byteLength == undefined ? au8_buff.length : au8_buff.byteLength;
    for (var i = 0; i < i_length; ++i) {
        str += String.fromCharCode(au8_buff[i] & 0xff);
    }
    return str;
}

var tsk_blob_reader = {
    readAs: function(type,blob,cb){
        var r = new FileReader();
        r.onloadend = function(){
            if(typeof(cb) === 'function') {
                cb.call(r,r.result);
            }
        }
        try{
            r['readAs'+type](blob);
        }catch(e){}
    }
}

function tsk_blob_parse(data){

    var shortVar, intVar, stringVar;
    var blob = data.blob;
    tsk_blob_reader.readAs('Text',blob.slice(0,4,'text/plain;charset=UTF-8'),function(result){
        shortVar = result;
        console.warn(shortVar);
    });

    tsk_blob_reader.readAs('ArrayBuffer',blob.slice(4,8),function(arr){
        intVar = (new Int32Array(arr))[0];
        console.warn(intVar);
    });

    tsk_blob_reader.readAs('ArrayBuffer',blob.slice(8,10),function(arr){
        intVar = (new Int16Array(arr))[0];
        console.warn(intVar);
    });

    tsk_blob_reader.readAs('ArrayBuffer',blob.slice(10,12),function(arr){
        intVar = (new Int16Array(arr))[0];
        console.warn(intVar);
    });

    tsk_blob_reader.readAs('Text',blob.slice(12,blob.size,'text/plain;charset=UTF-8'),function(result){
        stringVar = result;
        //console.warn(stringVar);
        if(stringVar){
            data.cb({o_self: data.o_self, data: stringVar});
        }
    });
}
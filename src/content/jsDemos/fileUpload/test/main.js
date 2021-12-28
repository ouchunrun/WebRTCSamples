function getImgURL(node) {
    console.log(node)
    let imgURL = "";
    try{
        let file = null;
        if(node.files && node.files[0] ){
            file = node.files[0];
        }else if(node.files && node.files.item(0)) {
            file = node.files.item(0);
        }
        try{
            //Firefox7.0
            imgURL =  file.getAsDataURL();
        }catch(e){
            //Firefox8.0以上
            imgRUL = window.URL.createObjectURL(file);
        }
    }catch(e){      //这里不知道怎么处理了，如果是遨游的话会报这个异常
        //支持html5的浏览器,比如高版本的firefox、chrome、ie10
        if (node.files && node.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                imgURL = e.target.result;
            };
            reader.readAsDataURL(node.files[0]);
        }
    }
    creatImg(imgRUL);
    return imgURL;
}

function creatImg(imgRUL){   //根据指定URL创建一个Img对象
    var textHtml = "<img src='"+imgRUL+"'/>";
    $(".mark").after(textHtml);
}
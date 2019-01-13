
var Paging = {
    // 在init里面把所有全局变量定义好,这些变量要在对象的其他方法中使用
    // 在init里调用本对象的其他方法
    init: function(){
        // this.$tabs这种起名方式有两点好处：
        //1.不会重名，因为每个对象中this代表的不同，
        //所以即使命名$tab在别的对象上使用，也不会重名
        //2.$tab中加$能一目了然是juqery对象
        this.$tabs = $('footer>div')
        this.$pages = $('main>section')
        this.bind()
    },
    //bind方法的作用是绑定各种事件
    bind: function(){
        //此时this还是paging对象。
        //但是在方法内的其他函数中，this可能另有所指。
        //所以一开始就将this所指的对象保存在方法作用域下，命名_this
        var _this = this
        this.$tabs.on('click',function(){
            var $this = $(this)
            var index = $this.index()
            $this.addClass('active')
            .siblings().removeClass('active')
             _this.$pages.eq(index).fadeIn().siblings().fadeOut()
        })
    }
}


var Helpers = {
    isToBottom : function($viewport,$content){
        return $viewport.height() + $viewport.scrollTop() + 20 >= $content.height()
    },
    creatNode: function(subject){
        var $node = $('<div class="item">\
        <a href="#">\
          <div class="cover">\
            <img src="" alt="">\
          </div>\
          <div class="detail">\
            <h2></h2>\
            <div class="extra"><span class="score"></span> / <span class="collection"></span>收藏</div>\
            <div class="extra"></div>\
            <div class="extra"></div>\
            <div class="extra"></div>\
          </div>\
        </a>\
      </div>')
      $node.find('a').attr('href', subject.alt)
      $node.find('.cover img').attr('src',subject.images.small)
      $node.find('.detail h2').text(subject.title)
      $node.find('.detail .score').text(subject.rating.average)
      $node.find('.detail .collection').text(subject.collect_count)
      $node.find('.detail .extra').eq(0).text(subject.year + ' / ' + subject.genres.join('、'))
      $node.find('.detail .extra').eq(1).text('导演：' + subject.directors.map(v=>v.name).join('、'))
      $node.find('.detail .extra').eq(2).text('主演：' + subject.casts.map(v=>v.name).join('、'))
      return $node
    }
}

var Top250 = {
    init: function(){
        var _this = this
        this.$section = $('#top250')
        this.$container = this.$section.find('.container')
        this.isLoading = false
        this.isFinished = false
        this.page = 0
        this.count = 10
        this.getData(function(data){
            _this.renderData(data)
            _this.page++
        })
        this.bind()
    },
    bind: function(){
        var _this = this
        this.$section.on('scroll',function(){
            console.log("scroll already")
            if(Helpers.isToBottom(_this.$section,_this.$container) && !_this.isFinished && !_this.isLoading){
                _this.getData(function(data){

                    _this.renderData(data)
                    _this.page +=1
                    if(_this.count*_this.page > data.total){
                        isFinished=true
                    }
                })
            }
        })
    },
    getData: function(callback){
        var _this=this
        this.isLoading = true
        this.$section.find('.loading').show()
        $.ajax({
            url: '//api.douban.com/v2/movie/top250',
            data: {
                start: this.count*this.page,
                count: this.count
            },
            dataType: 'jsonp'
        }).done(function(ret){
            _this.isLoading =false
            _this.$section.find('.loading').fadeOut()
            callback(ret)
        })
    },
    renderData: function(data){
        var _this =this
        data.subjects.forEach(function(item){
            var $node = Helpers.creatNode(item)
            _this.$container.append($node)
        })
    }

}


var Usboard = {

    init: function(){
        var _this = this
        // this.count = 10
        this.$section = $('#northUs')
        this.$container = this.$section.find('.container')
        this.getData(function(data){
            _this.renderData(data)
        })
    },
    getData: function(callback){
        var _this = this
        $.ajax({
            url: "//api.douban.com/v2/movie/us_box",
            data: {
                start:0,
                count:10
            },
            dataType: "jsonp"
        }).done(function(ret){
            callback(ret)
        })
    },
    renderData: function(data){
       var _this = this
       data.subjects.forEach(function(item){
           var $node = Helpers.creatNode(item.subject)
           _this.$container.append($node)
       })
    }
}



var Search = {
    init: function(){
        var _this =this
        this.$button = $('.search-area .button')
        this.$input = $('.search-area input')
        this.$section = $('#search')
        this.$container = this.$section.find('.container')
        this.isLoading = false
        this.isFinished = false
        this.page = 0
        this.count = 10
        this.bind()
    },
    bind: function(){
        var _this = this
        this.$button.on('click',function(){
            _this.getData(function(data){
                _this.$container.empty()
                _this.renderData(data)
            })
        })
        this.$input.on('keyup',function(e){
            if(e.key === "Enter"){
                _this.getData(function(data){
                    _this.$container.empty()
                    _this.renderData(data)
                })
            }
        })
        this.$section.on('scroll',function(){
            if(Helpers.isToBottom(_this.$section,_this.$container) && !_this.isLoading && !_this.isFinished){
                _this.getData(function(data){
                    _this.renderData(data)
                    _this.page +=1
                    if(_this.page*_this.count > data.total){
                        _this.isFinished = true
                    }
                })
            }
        })
    },
    getData: function(callback){
        var _this = this
        this.isLoading = true
        this.$section.find('.loading').show(500)
        let keyword = this.$input.val()
        $.ajax({
            url: "http://api.douban.com/v2/movie/search",
            data: {
                q: keyword,
                start: this.count*this.page,
                count: this.count
            },
            dataType: "jsonp"
        }).done(function(ret){
            _this.isLoading = false
            _this.$section.find('.loading').hide(500)
            callback(ret)
        })
    },
    renderData: function(data){
        var _this = this
        data.subjects.forEach(function(item){
            let $node = Helpers.creatNode(item)
            _this.$container.append($node)
        })

    }
}


var App = {
    init: function(){
        Paging.init()
        Top250.init()
        Usboard.init()
        Search.init()
    }
}

App.init()




var cheerio = require("cheerio");
module.exports = {
    getLocation:function(href) {
        var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
        return match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        }
    },
    getEntryHtml:function(msg,body){
        var $ = cheerio.load(body);
        if(msg.fixPath){
            var host = "http://"+this.getLocation(msg.url).hostname;
            $("img").each(function(){
                var src = $(this).attr("src");
                if(!src.match(/http/)){
                    $(this).attr("src",host+src);
                }
            });
        }
        return data = $(msg.area).html();
    }
};


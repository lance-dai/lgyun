var fis = module.exports = require('fis3');
fis.require.prefixes.unshift('lgyun');
fis.cli.name = 'lgyun';
fis.cli.info = require('./package.json');

/******************** dev start ********************/

//node_modules文件夹为npm的下载目录，有大量的冗余资源，可能导致编译失败。
//因此编译时屏蔽该目录，但是会自动找出其中被引用的资源。
fis.set('project.files', ['!node_modules/**']);
// 改用 npm 方案，而不是用 fis-components

// 采用 commonjs 模块化方案。
fis.hook('commonjs', {
    baseUrl: '.',
    extList: ['.js', '.jsx']
});

// 去掉fis的注释行 和  react 注释行
fis.match('*.html', {
    parser: function (content) {
        var globalReg = /<!--\s*fis-([^-]+)-start\s*-->(.|[\r\n\t])*?<!--\s*fis-([^-]+)-end\s*-->|<!--\s*react-[\w\W\r\n]*?-->/ig;
        var reg = /<!--\s*fis-([^-]+)-start\s*-->(.|[\r\n\t])*?<!--\s*fis-([^-]+)-end\s*-->/i;
        var arr = content.match(globalReg);
        if (arr !== null) {
            arr.forEach(function (code) {
                var mediaInfo = code.match(reg);
                if (mediaInfo[1] === mediaInfo[3]) {
                    var medias = mediaInfo[1].split('|');
                    var media = fis.project.currentMedia();
                    if (medias.indexOf(media) === -1) {
                        content = content.replace(code, '');
                    }
                }
            });
        }
        return content;
    }
});
fis.match('{/{components,widgets,page,modules}/**.js,*.jsx}', {
    parser: fis.plugin('babel-5.x', {
        sourceMaps: false,
        optional: ["es7.decorators", "es7.classProperties"]
    }),
    rExt: '.js'
});
fis.unhook('components');
fis.hook('node_modules', {
    ignoreDevDependencies: true // 忽略 devDep 文件
})
//less的混合样式文件，只会被其他less文件import，因此不需要单独发布。
fis.match(/^(.*)mixin\.less$/i, {
    release: false
});

fis.match('*.less', {
    parser: fis.plugin('less'),
    rExt: '.css'
});

// 设置成是模块化 js
fis.match('/{node_modules,**/components,**/page,**/modules,**/widgets}/**.{js,jsx}', {
    isMod: true
});

// 编译velocity
fis.match('**/page/**.html', {
    postprocessor: fis.plugin('velocity')
});

fis.match('**/*', {
    release: '/static/$0'
});

fis.match('*.html', {
    useCache: false,
    release: '/template/$0'
});

fis.match('/test/**', {
    release: '/$0'
});

//在编译期会被内嵌入js文件中，因此不需要发布。
fis.match('*.tpl',{
    release : false
});

//velocity模版对应的mock数据不需要发布。
fis.match('*.html.js', {
    release: false
});
// package.json 不需要发布
fis.match('package.json', {
    release: false
});
//文档不需要发布。
fis.match('*.md', {
    release: false
});

//fis配置文件不需要发布。
fis.match('fis-conf.js', {
    useCache: false,
    release: false
});

// js jsx import css  img
fis.match('*.{js,jsx}', {
    preprocessor: [
        fis.plugin('js-require-file'),
        fis.plugin('js-require-css')
    ]
})

//本地调试时，需要将所有子系统下面的server.conf合并到根目录下的server.conf文件，最后发布到config文件夹下。
fis.match('/server.conf', {
    postprocessor: function(content, file) {
        content = '';
        var modConnfPaths = fis.util.find(fis.project.getProjectPath(), ['/**/server.conf']);
        modConnfPaths.forEach(function(modConnfPath) {
            content += fis.util.read(modConnfPath);
        });
        return content;
    },
    useCache: false,
    release: '/config/server.conf'
});

fis.match('::package', {
    postpackager: fis.plugin('loader', {
        useInlineMap: true,
        allInOne: false
    })
});

/******************** dev end ********************/


/******************** qa start ********************/
fis.media('qa').match('*.{less,css,js}', {
    useHash: false
})

fis.media('qa').match('::image', {
    useHash: false
})

fis.media('qa').match('*.{less,css}', {
    useSprite: false
})

fis.media('qa').match('**/page/**.html', {
    postprocessor: null
})

fis.media('qa').match('::package', {
    spriter: fis.plugin('csssprites'),
    postpackager: fis.plugin('loader', {
        useInlineMap: false,
        allInOne: true
    })
});
//example不需要发布。
fis.media('qa').match('/example/**', {
    release: false
});

fis.media('qa').match('/test/**', {
    release: false
});
fis.media('qa').match('server.conf', {
    release: false
});
/******************** qa end ********************/


/******************** prod start ********************/
fis.media('prod').match('/{node_modules,**/components,**/widgets,**/static/js}/**.{js,jsx}', {
    optimizer: fis.plugin('uglify-js')
})
fis.media('prod').match('*.{less,css,js}', {
    useHash: true
})

fis.media('prod').match('::image', {
    useHash: true
})

fis.media('prod').match('*.{less,css}', {
    useSprite: true
})

fis.media('prod').match('**/page/**.html', {
    postprocessor: null
})

fis.media('prod').match('::package', {
    spriter: fis.plugin('csssprites'),
    postpackager: fis.plugin('loader', {
        useInlineMap: false,
        allInOne: true
    })
});
//example不需要发布。
fis.media('prod').match('/example/**', {
    release: false
});

fis.media('prod').match('/test/**', {
    release: false
});
fis.media('prod').match('server.conf', {
    release: false
});
/******************** prod end ********************/

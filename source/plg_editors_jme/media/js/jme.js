jQuery(function($) {
    ((function() {
        var toolbarIdentifiers = ['bold', 'italic', 'strike', 'link', 'image', 'blockquote', 'listUl', 'listOl'];
        if (typeof window.customToolbarElements !== 'undefined') {
            window.customToolbarElements.forEach(function(customToolbarElement) {
                toolbarIdentifiers.push(customToolbarElement.identifier);
            });
        }
        var toolbarButtons = {
            fullscreen: {
                title: 'Fullscreen',
                label: '<i class="jme-icon-enlarge2"></i>'
            },
            bold: {
                title: 'Bold',
                label: '<i class="jme-icon-bold"></i>'
            },
            italic: {
                title: 'Italic',
                label: '<i class="jme-icon-italic"></i>'
            },
            strike: {
                title: 'Strikethrough',
                label: '<i class="jme-icon-strikethrough"></i>'
            },
            blockquote: {
                title: 'Blockquote',
                label: '<i class="jme-icon-quotes-right"></i>'
            },
            link: {
                title: 'Link',
                label: '<i class="jme-icon-link"></i>'
            },
            image: {
                title: 'Image',
                label: '<i class="jme-icon-image"></i>'
            },
            listUl: {
                title: 'Unordered List',
                label: '<i class="jme-icon-list2"></i>'
            },
            listOl: {
                title: 'Ordered List',
                label: '<i class="jme-icon-list-numbered"></i>'
            }
        };
        if (typeof window.customToolbarElements !== 'undefined') {
            window.customToolbarElements.forEach(function(customToolbarElement) {
                toolbarButtons[customToolbarElement.identifier] = customToolbarElement.button;
            });
        }
        var debounce = function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this,
                    args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };
        var template = '';
        var JMEditor = function(editor, options) {
            var $this = this,
                task = 'task' + JMEAdmin.config.param_sep;
            var tpl = ''
            this.defaults = {
                markdown: false,
                autocomplete: true,
                height: 500,
                codemirror: {
                    mode: 'htmlmixed',
                    theme: 'paper',
                    lineWrapping: true,
                    dragDrop: true,
                    autoCloseTags: true,
                    matchTags: true,
                    autoCloseBrackets: true,
                    matchBrackets: true,
                    indentUnit: 4,
                    indentWithTabs: true,
                    lineNumbers: true,
                    styleActiveLine: true,
                    tabSize: 4,
                    hintOptions: {
                        completionSingle: true
                    },
                    extraKeys: {
                        "Enter": "newlineAndIndentContinueMarkdownList"
                    }
                },
                toolbar: toolbarIdentifiers,
                lblPreview: '<i class="jme-icon-eye"></i>',
                lblCodeview: '<i class="jme-icon-embed2"></i>',
                lblMarkedview: '<i class="jme-icon-embed2"></i>'
            };
            this.element = $(editor);
            this.options = $.extend({}, this.defaults, options);
            this.CodeMirror = CodeMirror;
            this.buttons = {};
            template = ['<div class="jme clearfix" data-mode="tab" data-active-tab="code">', '<div class="jme-navbar">', '<ul class="jme-navbar-nav jme-toolbar"></ul>', '<div class="jme-navbar-flip">', '<ul class="jme-navbar-nav">'];
            template.push('<li class="jme-button-code jme-active"><a>{:lblCodeview}</a></li>');
            template.push('<li class="jme-button-preview"><a>{:lblPreview}</a></li>');
            template.push('<li><a data-jme-button="fullscreen"><i class="jme-icon-enlarge2"></i></a></li>', '</ul>', '</div>', '<p class="jme-preview-text" style="display: none;">Preview</p>', '</div>', '<div class="jme-content">', '<div class="jme-code"></div>', '<div class="jme-preview"><div></div></div>', '</div>', '</div>');
            template = template.join('');
            tpl += template;
            tpl = tpl.replace(/\{:lblPreview\}/g, this.options.lblPreview);
            tpl = tpl.replace(/\{:lblCodeview\}/g, this.options.lblCodeview);
            this.jme = $(tpl);
            this.content = this.jme.find('.jme-content');
            this.toolbar = this.jme.find('.jme-toolbar');
            this.preview = this.jme.find('.jme-preview').children().eq(0);
            this.code = this.jme.find('.jme-code');
            this.element.before(this.jme).appendTo(this.code);
            this.editor = this.CodeMirror.fromTextArea(this.element[0], this.options.codemirror);
            // this.editor = Joomla.editors.instances[editor].fromTextArea(this.element[0], this.options.codemirror);
            this.editor.jme = this;
            if (this.options.markdown) {
                this.editor.setOption('mode', 'gfm');
            }
            this.editor.on('change', debounce(function() {
                $this.render();
            }, 150));
            this.editor.on('change', debounce(function() {
                $this.render();
            }, 150));
            this.editor.on('change', function() {
                $this.editor.save();
            });
            // this.editor.on('drop', function(editor, e) 
            // {
            //     e.preventDefault();                  
            //       var length = e.dataTransfer.items.length;
            //       for (var i = 0; i < length; i++) {
            //         var entry = e.dataTransfer.items[i].webkitGetAsEntry();
            //         var file = e.dataTransfer.files[i];
            //         var zip = file.name.match(/\.zip/);
            //         if (entry.isFile) {
            //             if(zip){
            //                 unzip(file);
            //             } else {
            //               var file = e.dataTransfer.files[i];
            //               upload(file);
            //             }
            //             if(i==length-1){
            //                 show(tablearr);
            //             }
            //         } else if (entry.isDirectory) {
            //          traverseFileTree(entry);
            //         } else {
            //             output.innerHTML = "Error. Only zip files are extracted."; 
            //         }
            //       }
            //     $this.render();
            // });
            this.code.find('.CodeMirror').css('height', this.options.height);
            var editor = this.editor;
            $("#jmeDropzone").delegate('[data-dz-insert]', 'click', function(e) {
                var target = $(e.currentTarget).parent('.dz-preview').find('.dz-filename');
                editor.focus();
                var filename = encodeURI(target.text());
                filename = filename.replace(/@3x|@2x|@1x/, '');
                filename = filename.replace(/\(/g, '%28');
                filename = filename.replace(/\)/g, '%29');
                if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                    editor.doc.replaceSelection('![](' + filename + ')');
                } else {
                    editor.doc.replaceSelection('[' + decodeURI(filename) + '](' + filename + ')');
                }
            });
            this.preview.container = this.preview;
            this.jme.on('click', '.jme-button-code, .jme-button-preview', function(e) {
                var task = 'task' + JMEAdmin.config.param_sep;
                e.preventDefault();
                if ($this.jme.attr('data-mode') == 'tab') {
                    if ($(this).hasClass('jme-button-preview')) {
                        var url = JMEAdmin.config.base_url_relative + 'index.php?option=com_ajax&plugin=jme&group=editors&format=html';
                        // console.log(url);
                        JMEAjax({
                            dataType: 'json',
                            url: url,
                            method: 'post',
                            // data: $this.element.parents('form').serialize(),
                            data: { text: editor.getValue()},
                            toastErrors: true,
                            success: function(response) {
                                // console.log(response);
                                $this.preview.container.html(response.message);
                            }
                        });
                    }
                    $this.jme.find('.jme-button-code, .jme-button-preview').removeClass('jme-active').filter(this).addClass('jme-active');
                    $this.activetab = $(this).hasClass('jme-button-code') ? 'code' : 'preview';
                    $this.jme.attr('data-active-tab', $this.activetab);
                    $this.editor.refresh();
                    if ($this.activetab == 'preview') {
                        $this.jme.find('.jme-toolbar').fadeOut('fast');
                        setTimeout(function() {
                            $this.jme.find('.jme-preview-text').fadeIn();
                        }, 250);
                    } else {
                        $this.jme.find('.jme-preview-text').fadeOut('fast');
                        setTimeout(function() {
                            $this.jme.find('.jme-toolbar').fadeIn();
                        }, 250);
                    }
                }
            });
            this.jme.on('click', 'a[data-jme-button]', function() {
                if (!$this.code.is(':visible')) return;
                $this.element.trigger('action.' + $(this).data('jme-button'), [$this.editor]);
            });
            this.preview.parent().css('height', this.code.height());
            if (this.options.autocomplete && this.CodeMirror.showHint && this.CodeMirror.hint && this.CodeMirror.hint.html) {
                this.editor.on('inputRead', debounce(function() {
                    var doc = $this.editor.getDoc(),
                        POS = doc.getCursor(),
                        mode = $this.CodeMirror.innerMode($this.editor.getMode(), $this.editor.getTokenAt(POS).state).mode.name;
                    if (mode == 'xml') {
                        var cur = $this.editor.getCursor(),
                            token = $this.editor.getTokenAt(cur);
                        if (token.string.charAt(0) == '<' || token.type == 'attribute') {
                            $this.CodeMirror.showHint($this.editor, $this.CodeMirror.hint.html, {
                                completeSingle: false
                            });
                        }
                    }
                }, 100));
            }
            this.debouncedRedraw = debounce(function() {
                $this.redraw();
            }, 5);
            JMEditors.editors[this.element.attr('name')] = this;
            this.element.data('jme_initialized', true);
            this.addButton = function(name, button) {
                this.buttons[name] = button;
            };
            this.addButtons = function(buttons) {
                $.extend(this.buttons, buttons);
            };
            this._buildtoolbar = function() {
                if (!(this.options.toolbar && this.options.toolbar.length)) return;
                var $this = this,
                    bar = [];
                this.toolbar.empty();
                this.options.toolbar.forEach(function(button) {
                    if (!$this.buttons[button]) return;
                    var title = $this.buttons[button].title ? $this.buttons[button].title : button;
                    var buttonClass = $this.buttons[button].class ? 'class="' + $this.buttons[button].class + '"' : '';
                    bar.push('<li><a data-jme-button="' + button + '" title="' + title + '" ' + buttonClass + ' data-uk-tooltip>' + $this.buttons[button].label + '</a></li>');
                });
                this.toolbar.html(bar.join('\n'));
            };
            this.fit = function() {
                var mode = this.options.mode;
                if (mode == 'split' && this.jme.width() < this.options.maxsplitsize) {
                    mode = 'tab';
                }
                if (mode == 'tab') {
                    if (!this.activetab) {
                        this.activetab = 'code';
                        this.jme.attr('data-active-tab', this.activetab);
                    }
                    this.jme.find('.jme-button-code, .jme-button-preview').removeClass('uk-active').filter(this.activetab == 'code' ? '.jme-button-code' : '.jme-button-preview').addClass('uk-active');
                }
                this.editor.refresh();
                this.preview.parent().css('height', this.code.height());
                this.jme.attr('data-mode', mode);
            };
            this.redraw = function() {
                this._buildtoolbar();
                this.render();
                this.fit();
            };
            this.getMode = function() {
                return this.editor.getOption('mode');
            };
            this.getCursorMode = function() {
                var param = {
                    mode: 'html'
                };
                this.element.trigger('cursorMode', [param]);
                return param.mode;
            };
            this.render = function() {
                this.currentvalue = this.editor.getValue().replace(/^---([\s\S]*?)---\n{1,}/g, '');
                if (!this.currentvalue) {
                    this.element.val('');
                    this.preview.container.html('');
                    return;
                }
                this.element.trigger('render', [this]);
                this.element.trigger('renderLate', [this]);
                this.preview.container.html(this.currentvalue);
            };
            this.addShortcut = function(name, callback) {
                var map = {};
                if (!$.isArray(name)) {
                    name = [name];
                }
                name.forEach(function(key) {
                    map[key] = callback;
                });
                this.editor.addKeyMap(map);
                return map;
            };
            this.addShortcutAction = function(action, shortcuts) {
                var editor = this;
                this.addShortcut(shortcuts, function() {
                    editor.element.trigger('action.' + action, [editor.editor]);
                });
            };
            this.replaceSelection = function(replace, action) {
                var text = this.editor.getSelection(),
                    indexOf = -1,
                    cur = this.editor.getCursor(),
                    curLine = this.editor.getLine(cur.line),
                    start = cur.ch,
                    end = start;
                if (!text.length) {
                    while (end < curLine.length && /[\w$]+/.test(curLine.charAt(end))) ++end;
                    while (start && /[\w$]+/.test(curLine.charAt(start - 1))) --start;
                    var curWord = start != end && curLine.slice(start, end);
                    if (curWord) {
                        this.editor.setSelection({
                            line: cur.line,
                            ch: start
                        }, {
                            line: cur.line,
                            ch: end
                        });
                        text = curWord;
                    } else {
                        indexOf = replace.indexOf('$1');
                    }
                }
                var html = replace.replace('$1', text);
                this.editor.replaceSelection(html, 'end');
                if (indexOf !== -1) {
                    this.editor.setCursor({
                        line: cur.line,
                        ch: start + indexOf
                    });
                } else {
                    if (action == 'link' || action == 'image') {
                        this.editor.setCursor({
                            line: cur.line,
                            ch: html.length - 1
                        });
                    }
                }
                this.editor.focus();
            };
            this.replaceLine = function(replace, action) {
                var pos = this.editor.getDoc().getCursor(),
                    text = this.editor.getLine(pos.line),
                    html = replace.replace('$1', text);
                this.editor.replaceRange(html, {
                    line: pos.line,
                    ch: 0
                }, {
                    line: pos.line,
                    ch: text.length
                });
                this.editor.setCursor({
                    line: pos.line,
                    ch: html.length
                });
                this.editor.focus();
            };
            this.save = function() {
                this.editor.save();
            };
            this._initToolbar = function(editor) {
                editor.addButtons(toolbarButtons);
                addAction('bold', '**$1**');
                addAction('italic', '_$1_');
                addAction('strike', '~~$1~~');
                addAction('blockquote', '> $1', 'replaceLine');
                addAction('link', '[$1](http://)');
                addAction('image', '![$1](http://)');
                editor.element.on('action.listUl', function() {
                    if (editor.getCursorMode() == 'markdown') {
                        var cm = editor.editor,
                            pos = cm.getDoc().getCursor(true),
                            posend = cm.getDoc().getCursor(false);
                        for (var i = pos.line; i < (posend.line + 1); i++) {
                            cm.replaceRange('* ' + cm.getLine(i), {
                                line: i,
                                ch: 0
                            }, {
                                line: i,
                                ch: cm.getLine(i).length
                            });
                        }
                        cm.setCursor({
                            line: posend.line,
                            ch: cm.getLine(posend.line).length
                        });
                        cm.focus();
                    }
                });
                editor.element.on('action.listOl', function() {
                    if (editor.getCursorMode() == 'markdown') {
                        var cm = editor.editor,
                            pos = cm.getDoc().getCursor(true),
                            posend = cm.getDoc().getCursor(false),
                            prefix = 1;
                        if (pos.line > 0) {
                            var prevline = cm.getLine(pos.line - 1),
                                matches;
                            if (matches = prevline.match(/^(\d+)\./)) {
                                prefix = Number(matches[1]) + 1;
                            }
                        }
                        for (var i = pos.line; i < (posend.line + 1); i++) {
                            cm.replaceRange(prefix + '. ' + cm.getLine(i), {
                                line: i,
                                ch: 0
                            }, {
                                line: i,
                                ch: cm.getLine(i).length
                            });
                            prefix++;
                        }
                        cm.setCursor({
                            line: posend.line,
                            ch: cm.getLine(posend.line).length
                        });
                        cm.focus();
                    }
                });
                if (typeof window.customToolbarElements !== 'undefined') {
                    window.customToolbarElements.forEach(function(customToolbarElement) {
                        editor.element.on('action.' + customToolbarElement.identifier, function() {
                            if (editor.getCursorMode() == 'markdown') {
                                customToolbarElement.processAction(editor);
                            }
                        });
                    });
                }
                editor.element.on('cursorMode', function(e, param) {
                    if (editor.editor.options.mode == 'gfm') {
                        var pos = editor.editor.getDoc().getCursor();
                        param.mode = 'markdown';
                    }
                });
                $.extend(editor, {
                    enableMarkdown: function() {
                        enableMarkdown();
                        this.render();
                    },
                    disableMarkdown: function() {
                        this.editor.setOption('mode', 'htmlmixed');
                        this.jme.find('.jme-button-code a').html(this.options.lblCodeview);
                        this.render();
                    }
                });
                editor.element.on({
                    enableMarkdown: function() {
                        editor.enableMarkdown();
                    },
                    disableMarkdown: function() {
                        editor.disableMarkdown();
                    }
                });

                function enableMarkdown() {
                    editor.editor.setOption('mode', 'gfm');
                    editor.jme.find('.jme-button-code a').html(editor.options.lblMarkedview);
                }
                editor.jme.on('click', 'a[data-jme-button="fullscreen"]', function() {
                    editor.jme.toggleClass('jme-fullscreen');
                    var wrap = editor.editor.getWrapperElement();
                    if (editor.jme.hasClass('jme-fullscreen')) {
                        editor.editor.state.fullScreenRestore = {
                            scrollTop: window.pageYOffset,
                            scrollLeft: window.pageXOffset,
                            width: wrap.style.width,
                            height: wrap.style.height
                        };
                        wrap.style.width = '';
                        wrap.style.height = editor.content.height() + 'px';
                        document.documentElement.style.overflow = 'hidden';
                    } else {
                        document.documentElement.style.overflow = '';
                        var info = editor.editor.state.fullScreenRestore;
                        wrap.style.width = info.width;
                        wrap.style.height = info.height;
                        window.scrollTo(info.scrollLeft, info.scrollTop);
                    }
                    setTimeout(function() {
                        editor.fit();
                        $(window).trigger('resize');
                    }, 50);
                });
                editor.addShortcut(['Ctrl-S', 'Cmd-S'], function() {
                    editor.element.trigger('jme-save', [editor]);
                });
                editor.addShortcutAction('bold', ['Ctrl-B', 'Cmd-B']);
                editor.addShortcutAction('italic', ['Ctrl-I', 'Cmd-I']);

                function addAction(name, replace, mode) {
                    editor.element.on('action.' + name, function() {
                        if (editor.getCursorMode() == 'markdown') {
                            editor[mode == 'replaceLine' ? 'replaceLine' : 'replaceSelection'](replace, name);
                        }
                    });
                }
            };
            this._initToolbar($this);
            this._buildtoolbar();
            return this;
        };
        var JMEditors = {
            editors: {},
            init: function() {
                var element;
                // $('textarea#jform_description').each(function() {
                $('*[data-jme]').each(function() {
                    element = $(this);
                    if (!element.parents('[data-collection-template="new"]').length) {
                        JMEditors.add(element);
                    }
                });
            },
            add: function(editor) {
                editor = $(editor);
                var jme;
                if (!editor.data('jme_initialized')) {
                    jme = new JMEditor(editor, JSON.parse(editor.attr('data-jme') || '{"markdown":true}'));
                }
                return jme || JMEditors.editors[editor.attr('name')];
            }
        };
        $(function() {
            JMEditors.init();
        });
        window.JMEditors = JMEditors;
    })());
});
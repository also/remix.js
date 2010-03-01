task :init do
  sh 'git submodule init'
  sh 'git submodule update'
  sh 'if test ! -f lib/as3corelib-.92.1/lib/as3corelib.swc; then curl -O http://as3corelib.googlecode.com/files/as3corelib-.92.1.zip && unzip as3corelib-.92.1.zip as3corelib-.92.1/lib/as3corelib.swc -d lib && rm as3corelib-.92.1.zip; fi'
  sh 'if test ! -d lib/MP3FileReferenceLoaderLib; then svn co http://echo-nest-remix.googlecode.com/svn/trunk/flash/MP3FileReferenceLoaderLib lib/MP3FileReferenceLoaderLib@382; fi'
end

task :dist do
  sh 'mkdir -p dist'
end

task :js => [:dist] do
  sh 'cat src/js/*.js > dist/remix.js'
end

task :swf => [:init, :dist] do
  sh 'mxmlc -source-path lib/flash-audio/src lib/echo-nest-flash-api/src lib/MP3FileReferenceLoaderLib/src -library-path+=lib/as3corelib-.92.1/lib/as3corelib.swc -output dist/remix.swf -- src/editor/player.mxml'
end

task :clean do
  sh 'rm -rf dist'
end

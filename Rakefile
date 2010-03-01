task :init do
  sh 'git submodule init'
  sh 'git submodule update'
  sh "if test ! -f lib/as3corelib-.92.1/lib/as3corelib.swc; then curl -O http://as3corelib.googlecode.com/files/as3corelib-.92.1.zip && unzip as3corelib-.92.1.zip as3corelib-.92.1/lib/as3corelib.swc -d lib && rm as3corelib-.92.1.zip; fi"
end

task :remixjs => [:init] do
  sh 'mkdir -p dist'
  sh 'cat src/js/*.js > dist/remix.js'
end

task :clean do
  sh 'rm -rf dist'
end

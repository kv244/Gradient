eval 'set +o history' 2>/dev/null || setopt HIST_IGNORE_SPACE 2>/dev/null
 touch ~/.gitcookies
 chmod 0600 ~/.gitcookies

 git config --global http.cookiefile ~/.gitcookies

 tr , \\t <<\__END__ >>~/.gitcookies
source.developers.google.com,FALSE,/,TRUE,2147483647,o,git-razvan.petrescu.gmail.com=1//0gUQ-lOMjTUKCCgYIARAAGBASNgF-L9IrltQ71X52lBvF36fjEKoju4Ided6r1e7zkX-hQQ75wabQMDE8ff6sO5c2M_5tNgHXpw
__END__
eval 'set -o history' 2>/dev/null || unsetopt HIST_IGNORE_SPACE 2>/dev/null

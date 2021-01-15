#!/bin/bash

sudo apt-get update
sudo apt-get install -y software-properties-common
sudo rm -rf /var/lib/apt/lists/*
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt-get update
sudo apt-get -y install gcc-4.8 g++-4.8 build-essential pkg-config qt4-qmake libqt4-dev git wget
git clone https://github.com/nfroidure/woff2.git
# We want to compile with g++ 4.8 when rather than the default g++
(cd woff2 && export CC=/usr/bin/gcc-4.8 && export CXX=/usr/bin/g++-4.8 && git submodule init && git submodule update && make clean all)
export PATH=$PATH:$(pwd)/woff2
pushd tests/ttfautohint
ROOT_DIR="$PWD"
export PKG_CONFIG_PATH="$ROOT_DIR/lib/pkgconfig"
wget http://download.savannah.gnu.org/releases/freetype/freetype-2.6.3.tar.bz2
tar xjf freetype-2.6.3.tar.bz2
(cd freetype-2.6.3 && ./configure --prefix="$ROOT_DIR" --without-harfbuzz && make install && make distclean)
wget https://www.freedesktop.org/software/harfbuzz/release/harfbuzz-1.2.7.tar.bz2
tar xjf harfbuzz-1.2.7.tar.bz2
(cd harfbuzz-1.2.7 && ./configure --prefix="$ROOT_DIR" && make install)
(cd freetype-2.6.3 && ./configure --prefix="$ROOT_DIR" && make install)
wget http://downloads.sourceforge.net/project/freetype/ttfautohint/1.5/ttfautohint-1.5.tar.gz
tar xzf ttfautohint-1.5.tar.gz
(cd ttfautohint-1.5 && ./configure --prefix="$ROOT_DIR" && make install)
popd
export PATH="$PATH:$ROOT_DIR/bin"
export LD_LIBRARY_PATH="$ROOT_DIR/lib:$LD_LIBRARY_PATH"

function createData(size){
    return {
        data: new DataView(new ArrayBuffer(size)),
        
        read: function(index){
            return this.data.getUint8(index)
        },

        write: function(index, data){
            this.data.setUint8(index, data)
        }
    }
}

var BEGIN_FILE_SYSTEM_INDEX = 0

function createFileSystem(data){
    data.write(BEGIN_FILE_SYSTEM_INDEX, 0)
}

function printFiles(data){
    for(var index = BEGIN_FILE_SYSTEM_INDEX; data.read(index); ){
        var name = ''

        ++index
        for(; data.read(index); ++index)
            name += String.fromCharCode(data.read(index))

        ++index

        var fileSize =
            data.read(index)
            + data.read(index + 1) * 256
            + data.read(index + 2) * 256 * 256
            + data.read(index + 3) * 256 * 256 * 256

        index += 4

        console.log(name)

        index += fileSize
    }
}

function createFile(name, size, data){
    for(var index = BEGIN_FILE_SYSTEM_INDEX; data.read(index); ){

        ++index
        for(; data.read(index); ++index);

        ++index

        var fileSize =
            data.read(index)
            + data.read(index + 1) * 256
            + data.read(index + 2) * 256 * 256
            + data.read(index + 3) * 256 * 256 * 256

        index += 4
        index += fileSize
    }

    data.write(index, 1)
    ++index

    for(var i = 0; i < name.length; ++i, ++index)
        data.write(index, name[i].charCodeAt())

    data.write(index, 0)
    ++index

    data.write(index, size % 256)
    data.write(index + 1, size / 256 % 256)
    data.write(index + 2, size / 256 / 256 % 256)
    data.write(index + 3, size / 256 / 256 / 256 % 256)
    index += 4

    data.write(index, 0)
}

function openFile(name, data){
    var fileFinded

    for(var index = BEGIN_FILE_SYSTEM_INDEX; data.read(index); ){
        fileFinded = true

        ++index
        for(var i = 0; data.read(index); ++index, ++i)
            if(name[i] != String.fromCharCode(data.read(index)))
                fileFinded = false

        ++index

        var fileSize =
            data.read(index)
            + data.read(index + 1) * 256
            + data.read(index + 2) * 256 * 256
            + data.read(index + 3) * 256 * 256 * 256

        index += 4

        if(fileFinded)
            break

        index += fileSize
    }

    if(fileFinded)
        return {
            index: index,
            size: fileSize
        }
    else
        return {
            index: 0,
            size: 0
        }
}
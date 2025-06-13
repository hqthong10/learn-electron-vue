export function attachChooseFile(accept: string, isMulti = false, callback: (files: File[], event: Event) => void) {
    const $inputFile = document.createElement('input');
    $inputFile.type = 'file';
    $inputFile.multiple = isMulti;
    $inputFile.accept = accept;
    $inputFile.addEventListener('change', inputFileChange);

    function inputFileChange(event: Event) {
        const files = Array.from($inputFile.files);

        if (files && files.length && callback) {
            callback(files, event);
        }

        $inputFile.value = '';
    }
    $inputFile.click();

    return inputFileChange;
}
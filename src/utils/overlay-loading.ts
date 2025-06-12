import { ref } from 'vue';

const visible = ref(false);
const text = ref('');

export const overloading = {
    show(msg?: string) {
        text.value = msg || '';
        visible.value = true;
    },
    hide() {
        visible.value = false;
    },
    _visible: visible,
    _text: text
};

(globalThis as any).overloading = overloading;

export function fontCss(dir) {
  const f = (w, file) => `@font-face{font-family:'Poppins';font-weight:${w};src:url(${dir}/${file}) format('truetype');font-display:block}`;
  return f(500, 'Poppins-Medium.ttf') + f(600, 'Poppins-SemiBold.ttf') + f(700, 'Poppins-Bold.ttf') + f(800, 'Poppins-ExtraBold.ttf') +
    `@font-face{font-family:'Anton';font-weight:400;src:url(${dir}/Anton-Regular.ttf) format('truetype');font-display:block}`;
}

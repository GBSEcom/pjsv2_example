
const hasClass = (el: any, cssClass: any) => {
  if (el.classList) {
    return el.classList.contains(cssClass);
  }
  return !!el.className.match(new RegExp(`(\\s|^)${cssClass}(\\s|$)`));
};

export const addClass = (elm: any, cssClass: any) => {
  const el = elm;
  if (el.classList) {
    el.classList.add(cssClass);
  } else if (!hasClass(el, cssClass)) {
    el.className += ` ${cssClass}`;
  }
};

export const removeClass = (elm: any, cssClass: any) => {
  const el = elm;
  if (el.classList) {
    el.classList.remove(cssClass);
  } else if (hasClass(el, cssClass)) {
    const reg = new RegExp(`(\\s|^)${cssClass}(\\s|$)`);
    el.className = el.className.replace(reg, ' ');
  }
};

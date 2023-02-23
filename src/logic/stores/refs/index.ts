import { map } from "nanostores";

export const refs = map<Record<string, HTMLElement>>({});

export const updateRefs = (ref: HTMLElement, name: string) => {
  refs.setKey(name, ref);
};

export const validateRef = (name: string) => {
  return refs.get()[name];
}

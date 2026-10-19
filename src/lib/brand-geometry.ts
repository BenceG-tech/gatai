// Approved compact Signature Type geometry, shared by SVG and 3D.
export const letters = [
  {
    id: "g",
    d: "M220 44H64C22 44 0 65 0 110S22 176 64 176H218V104H104V134H184V143H67C44 143 34 132 34 110S44 77 67 77H193Z",
    tone: "silver",
    shift: 0,
  },
  {
    id: "a",
    d: "M326 44H356L449 176H410L341 82L273 176H234Z",
    tone: "silver",
    shift: 0,
  },
  {
    id: "t",
    d: "M464 44H663L641 77H579V176H546V77H464Z",
    tone: "silver",
    shift: -54,
  },
  {
    id: "ai",
    d: "M765 44H795L888 176H849L780 82L711 176H672ZM756 126H805L823 151H738Z",
    tone: "azure",
    shift: -108,
  },
  {
    id: "i",
    d: "M918 44H952V176H918Z",
    tone: "azure",
    shift: -108,
  },
  {
    id: "accent",
    d: "M332 0H371L350 27H311Z",
    tone: "silver",
    shift: 0,
  },
] as const;
export const studioPaths = [
  "M190 213H159Q151 213 151 220Q151 226 159 226H179Q187 226 187 233Q187 241 179 241H148",
  "M265 213H307M286 213V241",
  "M385 213V231Q385 241 397 241H410Q422 241 422 231V213",
  "M500 213H521Q541 213 541 227Q541 241 521 241H500Z",
  "M620 213V241",
  "M718 213H733Q746 213 746 227Q746 241 733 241H718Q705 241 705 227Q705 213 718 213Z",
] as const;

import type { Language } from '../i18n';
export interface LessonSlide { id: string; title: Record<Language, string>; body: Record<Language, string>; }
export const slides: LessonSlide[] = [
 { id:'intro', title:{es:'¿Cómo predice texto un Transformer?',en:'How does a Transformer predict text?'}, body:{es:'Explora el camino de los tokens hasta la predicción.',en:'Explore the path from tokens to prediction.'}},
 { id:'embedding', title:{es:'1 · Tokens y embeddings',en:'1 · Tokens and embeddings'}, body:{es:'Cada token recibe un vector y una posición.',en:'Each token gets a vector and a position.'}},
 { id:'attention', title:{es:'2 · Atención',en:'2 · Attention'}, body:{es:'Query, Key y Value combinan información del contexto. La máscara causal evita mirar al futuro.',en:'Query, Key and Value combine context. A causal mask prevents looking ahead.'}},
 { id:'mlp', title:{es:'3 · MLP y bloques',en:'3 · MLP and blocks'}, body:{es:'La atención mezcla información; la MLP transforma cada representación.',en:'Attention mixes information; the MLP transforms each representation.'}},
 { id:'softmax', title:{es:'4 · Logits y softmax',en:'4 · Logits and softmax'}, body:{es:'Los logits se transforman en probabilidades del siguiente token.',en:'Logits become next-token probabilities.'}},
 { id:'sampling', title:{es:'5 · Temperatura y muestreo',en:'5 · Temperature and sampling'}, body:{es:'Prueba temperatura, top-k y top-p. ¿Qué cambia?',en:'Try temperature, top-k and top-p. What changes?'}}
];

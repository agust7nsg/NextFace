import type { RoutineFlow } from "../types/routine";

export const MASSAGES_FLOW: RoutineFlow = {
  id: "facial-massages",
  title: "Facial Massages",
  titleEs: "Masajes faciales",
  steps: [
    {
      id: 1,
      title: "Prep & Hydrate",
      titleEs: "Preparación e hidratación",
      description:
        "Apply a generous layer of moisturizer across your face and neck. Make sure your skin feels well hydrated, as this will help your fingertips glide smoothly during the massage without pulling or irritating the skin.",
      descriptionEs:
        "Aplica una capa generosa de hidratante por todo el rostro y el cuello. Asegúrate de que tu piel quede bien hidratada, ya que esto ayudará a que tus yemas se deslicen suavemente durante el masaje sin tirar ni irritar la piel.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/RRoutine%20img%201.png",
      durationSeconds: 60,
    },
    {
      id: 2,
      title: "Lymphatic Activation",
      titleEs: "Activación linfática",
      description:
        "Gently massage the soft areas beneath your ears and along the back of your jaw in small circles. This prepares your face for the drainage movements ahead.",
      descriptionEs:
        "Masajea suavemente las zonas blandas debajo de las orejas y a lo largo de la parte posterior de la mandíbula con pequeños círculos. Esto prepara tu rostro para los movimientos de drenaje que vienen a continuación.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/2-lymphatic%20activation.png",
      durationSeconds: 120,
    },
    {
      id: 3,
      title: "Cheek Lift & Sculpt",
      titleEs: "Elevación y esculpido de pómulos",
      description:
        "Place your index and middle fingers along your cheekbones. Sweep outward toward your ears with firm, steady pressure to encourage lymphatic flow and lift.",
      descriptionEs:
        "Coloca los dedos índice y medio sobre los pómulos. Desliza hacia las orejas con una presión firme y constante para favorecer el flujo linfático y la elevación.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/3-Cheek%20lift%20sculp.png",
      durationSeconds: 180,
    },
    {
      id: 4,
      title: "Jawline Definition",
      titleEs: "Definición de la mandíbula",
      description:
        "Starting from the chin, drag your index and middle fingers along the jawline toward your ears. This helps release tension and define the jaw area.",
      descriptionEs:
        "Comenzando desde la barbilla, desliza los dedos índice y medio a lo largo de la línea de la mandíbula hacia las orejas. Esto ayuda a liberar la tensión y definir la zona de la mandíbula.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/4-jawline%20definition.png",
      durationSeconds: 240,
    },
    {
      id: 5,
      title: "Lymphatic Drainage",
      titleEs: "Drenaje linfático",
      description:
        "Using gentle sweeping motions from the center of your face outward and down the neck, guide retained fluid toward your lymph nodes for drainage.",
      descriptionEs:
        "Con movimientos suaves de barrido desde el centro del rostro hacia afuera y hacia abajo por el cuello, guía el líquido retenido hacia tus ganglios linfáticos para su drenaje.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/5-lymphatic%20drainage.png",
      durationSeconds: 180,
    },
    {
      id: 6,
      title: "Final Drainage",
      titleEs: "Drenaje final",
      description:
        "Finish with gentle downward strokes along the sides of your neck, moving from just below your ears toward your collarbones. Keep the pressure light and repeat slowly to complete the drainage sequence.",
      descriptionEs:
        "Termina con trazos suaves hacia abajo a lo largo de los lados del cuello, moviéndote desde justo debajo de las orejas hacia las clavículas. Mantén la presión ligera y repite lentamente para completar la secuencia de drenaje.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/6-final%20drainage.png",
      durationSeconds: 120,
    },
  ],
};

export const ICING_FLOW: RoutineFlow = {
  id: "facial-icing",
  title: "Facial Icing",
  titleEs: "Hielo facial",
  steps: [
    {
      id: 1,
      title: "Prepare Your Ice",
      titleEs: "Prepara tu hielo",
      description:
        "Grab an ice cube. It is highly recommended to wrap it in a clean, thin cloth before applying it to your face. Never leave the ice sitting in one spot. Keep it moving throughout the routine.",
      descriptionEs:
        "Toma un cubito de hielo. Es muy recomendable envolverlo en un paño limpio y fino antes de aplicarlo en el rostro. Nunca dejes el hielo en un solo punto. Mantenlo en movimiento durante toda la rutina.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/Routine%20img%202.png",
      durationSeconds: 60,
    },
    {
      id: 2,
      title: "Cool the Forehead",
      titleEs: "Enfría la frente",
      description:
        "Gently move the wrapped ice across your forehead using slow, continuous motions. Cover the area evenly without pressing hard or lingering in one place.",
      descriptionEs:
        "Mueve suavemente el hielo envuelto por la frente con movimientos lentos y continuos. Cubre la zona de manera uniforme sin presionar fuerte ni detenerte en un solo lugar.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/2-cool%20forehead.png",
      durationSeconds: 90,
    },
    {
      id: 3,
      title: "Refresh the Eye Area",
      titleEs: "Refresca el contorno de ojos",
      description:
        "Lightly glide around the under-eye area and toward the outer corners. Use minimal pressure here and keep each pass brief, as the skin around the eyes is more delicate.",
      descriptionEs:
        "Desliza suavemente alrededor de la zona inferior del ojo y hacia las esquinas externas. Usa una presión mínima aquí y mantén cada pasada breve, ya que la piel alrededor de los ojos es más delicada.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/3-refresh%20eye%20area.png",
      durationSeconds: 90,
    },
    {
      id: 4,
      title: "Cool the Cheeks",
      titleEs: "Enfría las mejillas",
      description:
        "Move across each cheek using gentle circular or sweeping motions. Work across the full cheek area rather than following a specific drainage path, keeping the ice constantly moving.",
      descriptionEs:
        "Recorre cada mejilla con movimientos suaves circulares o de barrido. Trabaja toda la zona de la mejilla en lugar de seguir una ruta de drenaje específica, manteniendo el hielo en constante movimiento.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/4-cool%20cheeks.png",
      durationSeconds: 90,
    },
    {
      id: 5,
      title: "Chin & Jaw",
      titleEs: "Barbilla y mandíbula",
      description:
        "Continue across the chin and jaw area with smooth, continuous movements. Spend a little time covering both sides evenly without holding the ice against any single point.",
      descriptionEs:
        "Continúa por la zona de la barbilla y la mandíbula con movimientos suaves y continuos. Dedica un poco de tiempo a cubrir ambos lados de manera uniforme sin sostener el hielo contra ningún punto en particular.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/5-chin%20and%20jaw.png",
      durationSeconds: 90,
    },
    {
      id: 6,
      title: "Finish & Recover",
      titleEs: "Finaliza y recupérate",
      description:
        "Remove the ice and gently pat your skin dry if needed. Give your skin a moment to return to its normal temperature, then finish with your usual moisturizer.",
      descriptionEs:
        "Retira el hielo y seca suavemente tu piel si es necesario. Dale a tu piel un momento para volver a su temperatura normal y luego termina con tu hidratante habitual.",
      imageUrl:
        "https://hebwatwkpszebonmrige.supabase.co/storage/v1/object/public/nextface%20images/6-finish%20and%20recover.png",
      durationSeconds: 60,
    },
  ],
};

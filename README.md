# 🫀 NEUROSPACE — Interactive 3D Humanome Anatomy & Neural Architecture Simulator

> 📌 **Executive Summary:** **NEUROSPACE** is an enterprise-grade 3D WebGL Medical Atlas and Neural Architecture Simulator built on the official open-source **Z-Anatomy (BodyParts3D)** clinical coordinate system (referenced from Humanome). It delivers full-fidelity 3D exploration across all six human bodily systems — **Skeletal (206 articulated bones)**, **Muscular (400+ muscle groups)**, **Cardiovascular (systemic arterial & venous tree)**, **Visceral Organs (Liver Couinaud segments, Heart, Lungs, Kidneys, Pancreas, Stomach, Intestines)**, **Nervous (Cerebrum, 12 Cortical Territories, Spinal Axis, Brachial/Sciatic Plexuses)**, and **Integumentary Skin Envelope & Dermatomes (C2–S5)**. Supports 4 real-time radiological rendering modes (**X-Ray**, **Photoreal Standard**, **Computed Tomography CT**, and **Magnetic Resonance Imaging MRI**), live Hodgkin-Huxley biophysical action potential cascades, 8 clinical neurological pathologies, and an integrated **NeuroAI** clinical tutor.

---

## 📋 Project Metadata Properties

| Property | Value |
| :--- | :--- |
| **Project Title** | NEUROSPACE — Interactive 3D Humanome Anatomy & Neural Simulator |
| **Version** | `2.1.0` Production Grade |
| **Workspace Directory** | `L:\pr 30(NEUROSPACE)` |
| **Reference Architecture** | Humanome (`humanome.co`) / Z-Anatomy Clinical 3D Coordinate Standard |
| **Primary Visual Palette** | **Teal & Oat Milk** (`#14B8A6` Surgical Teal + `#091211` Deep Slate Void + `#0D1917` Abyss + `#F6F3E9` Warm Oat Milk Text + `#E11D48` Arterial Crimson + `#2563EB` Venous Blue) via `colours for websites` skill |
| **Frontend Stack** | React 19, TypeScript 5.8+, Vite 6, Tailwind CSS v3.4+, Three.js WebGL2 (`three@0.175.0`), GLTFLoader, MeshoptDecoder, Lucide Icons |
| **3D Anatomical Assets** | 6 Sub-system Z-Anatomy GLBs (`z-skeleton.glb`, `z-organs.glb`, `z-muscular.glb`, `z-nervous.glb`, `z-cardiovascular.glb`, `z-skin.glb`) with Authentic Clinical Mesh Isolation & Real-Time PBR Shaders |
| **Rendering Modes** | **X-Ray Multi-Layer Hologram**, **Photoreal Anatomical Standard**, **Computed Tomography (CT Radiographic)**, **Magnetic Resonance Imaging (MRI Tissue Contrast)** |
| **Verified Verification Suite** | Playwright WebGL2 Chromium headless verification (`1440×900`), 0 console errors, 10/10 high-res state screenshots captured |
| **Public GitHub Repository** | [`KARTHIKEYASHARMA672/neurospace`](https://github.com/KARTHIKEYASHARMA672/neurospace) (`main`) |
| **Hosted Production URL** | [https://neurospace-3d.vercel.app](https://neurospace-3d.vercel.app) (HTTP 200 OK via Vercel) |
| **LinkedIn Showcase Schedule** | Day 18 Queue (`automation_tracker.json` & `posts_ready.json`) |

---

## 🖼️ Verified Visual UI Gallery

> 📸 *All 10 visual artifacts below are verified live screenshots rendered using Playwright WebGL Chromium headless suite against the production build with Meshopt-decoded authentic Z-Anatomy clinical 3D organ models.*

| 01 — Heart & Coronary Vessels (3D Focused View) | 02 — Heart Coronal Cutaway (Internal Chambers & Valves) |
| :---: | :---: |
| ![01 Heart Exterior](./screenshots/01_3d_heart_exterior_coronary_vessels.png) | ![02 Heart Cutaway](./screenshots/02_3d_heart_interior_cutaway_chambers.png) |
| *True-to-life 3D myocardium showing ascending aorta, aortic arch with 3 carotid branches, LAD, and RCA.* | *Interactive coronal cross-section revealing internal right/left ventricles, mitral/tricuspid valves, and papillary muscular columns.* |

| 03 — Brain & Cerebral Cortex 3D Atlas | 04 — Lungs & Tracheobronchial Airway Tree |
| :---: | :---: |
| ![03 Brain Atlas](./screenshots/03_3d_brain_cerebral_cortex_atlas.png) | ![04 Lungs Airway](./screenshots/04_3d_lungs_tracheobronchial_tree.png) |
| *Sculpted cerebral gyri/sulci, temporal/occipital lobes, cerebellum with folia, and synaptically pulsing neural core.* | *Trachea with C-shaped cartilaginous rings, carina bifurcation, primary bronchi, and bilateral 5 lobes with cardiac notch.* |

| 05 — Liver, Couinaud Segments & Gallbladder | 06 — Kidneys & Coronal Nephron Cross-Section |
| :---: | :---: |
| ![05 Liver Biliary](./screenshots/05_3d_liver_gallbladder_biliary.png) | ![06 Kidneys Urinary](./screenshots/06_3d_kidneys_urinary_tract.png) |
| *Large hepatic parenchyma displaying right and left anatomical lobes, falciform demarcation, and emerald green gallbladder.* | *Bilateral retroperitoneal kidneys, suprarenal adrenal caps, renal cortex, medullary pyramids, calyces, and descending ureters.* |

| 07 — Articulated Skeletal Framework (206 Bones) | 08 — Muscular System (650+ Striated Muscles) |
| :---: | :---: |
| ![07 Skeleton System](./screenshots/07_3d_articulated_skeleton.png) | ![08 Muscular System](./screenshots/08_3d_muscular_kinetic_system.png) |
| *Clean isolated full-body articulated skeleton displaying axial vertebral column, ribcage, cranium, and extremities.* | *Z-Anatomy striated muscular anatomy revealing superficial and deep kinetic chains with subtle translucent bone support.* |

| 09 — Full Human Body 6-Layer Multi-System Composite | 10 — X-Ray Radiological Hologram Mode |
| :---: | :---: |
| ![09 Full Body Composite](./screenshots/09_3d_full_human_body_composite.png) | ![10 X-Ray Mode](./screenshots/10_3d_xray_radiological_hologram.png) |
| *Seamless composite of all 6 Z-Anatomy layers: Skeleton, Muscular, Organs, Vascular, Nervous, and Skin.* | *Radiological depth mode rendering multi-layer translucent bone, vascular, and organ structures.* |

### 🎨 Clinical Medical Illustration Reference Standards

> 📖 *These publication-grade medical illustrations served as the anatomical reference blueprints for the 3D Z-Anatomy mesh isolation engines, ensuring 1:1 fidelity without missing a single coronary branch, sulcal wrinkle, or organ boundary.*

| 01 — Heart & Coronary Perfusion Reference | 02 — Heart Internal Chambers & Papillary Muscles Reference |
| :---: | :---: |
| ![01 Heart Reference](./screenshots/01_image_reference_heart_exterior_coronary.jpg) | ![02 Heart Cutaway Reference](./screenshots/02_image_reference_heart_interior_cutaway.jpg) |
| *Clinical anterior coronary view: Ascending aorta, LAD, and circumflex branches.* | *Coronal split cross-section: Left/Right ventricles, atria, and atrioventricular valves.* |

| 03 — Brain & Nervous Architecture Reference | 04 — Lungs & Tracheobronchial Tree Reference |
| :---: | :---: |
| ![03 Brain Reference](./screenshots/03_image_reference_brain_nervous_system.jpg) | ![04 Lungs Reference](./screenshots/04_image_reference_respiratory_lungs_tree.jpg) |
| *Cerebral cortex gyri/sulci, cerebellum folia, brainstem, and spinal cord.* | *Trachea, cartilaginous rings, primary bronchi, and bilateral 5 pulmonary lobes.* |

| 05 — Liver, Gallbladder & Portal System Reference | 06 — Kidneys & Excretory Nephron Reference |
| :---: | :---: |
| ![05 Liver Reference](./screenshots/05_image_reference_liver_biliary_system.jpg) | ![06 Kidneys Reference](./screenshots/06_image_reference_kidneys_urinary_system.jpg) |
| *Hepatic parenchyma, Couinaud segmentation, and gallbladder storage.* | *Bilateral retroperitoneal kidneys, suprarenal adrenal caps, ureters, and bladder.* |

| 07 — Skeletal Articulated Framework Reference | 08 — Muscular System & Kinetic Chains Reference |
| :---: | :---: |
| ![07 Skeleton Reference](./screenshots/07_image_reference_skeletal_system.jpg) | ![08 Muscular Reference](./screenshots/08_image_reference_muscular_system.jpg) |
| *206 articulated bones across axial cranium, spine, and appendicular extremities.* | *Striated superficial and deep muscular kinetic layers.* |

| 09 — Full Body Multi-System Reference | 10 — Digestive Stomach & Pancreas Reference |
| :---: | :---: |
| ![09 Full Body Reference](./screenshots/09_image_reference_fullbody_composite.jpg) | ![10 Digestive Reference](./screenshots/10_image_reference_digestive_stomach_system.jpg) |
| *Multi-system sagittal composite across all 6 human bodily layers.* | *J-shaped stomach, fundus, pyloric antrum, pancreas, and duodenal C-loop.* |

---

## 🫀 Complete Human Body Systems & Organs Index

NEUROSPACE models the entire human physiology using clinical 3D coordinate alignments inspired by Z-Anatomy and Humanome:

### 1. Visceral & Internal Organs Index (`z-organs.glb`)
- **Liver & Biliary Tree:** Complete 8 Couinaud segments, portal venous inflow, hepatic veins, and green-pigmented Gallbladder.
- **Heart & Great Vessels:** Four cardiac chambers (Atria & Ventricles), ascending/descending aorta, pulmonary trunk, and coronary sulci.
- **Lungs & Respiratory Tree:** Bilateral lungs with right 3-lobed (superior, middle, inferior) and left 2-lobed morphology, primary bronchi, and tracheal cartilages.
- **Kidneys & Urinary Tract:** Bilateral retroperitoneal kidneys, renal cortex/medulla, ureteral conduits, and urinary bladder.
- **Pancreas & Gastrointestinal Duct:** Endocrine islets and exocrine acini nestled along the C-loop of the duodenum.
- **Stomach & Spleen:** J-shaped gastric reservoir, gastroesophageal junction, pyloric sphincter, and splenic lymphoid parenchyma.
- **Intestinal Tract:** Duodenum, jejunum, ileum, ascending/transverse/descending colon, and sigmoid rectum.
- **Endocrine Glands:** Thyroid gland over the thyroid cartilage and bilateral adrenal suprarenal caps.

### 2. Skeletal System (`z-skeleton.glb`)
- **Axial Skeleton:** Cranium (frontal, parietal, temporal, occipital, sphenoid), 24 articulated vertebrae (7 cervical, 12 thoracic, 5 lumbar), sacrum, coccyx, sternum, and 12 pairs of costal ribs.
- **Appendicular Skeleton:** Pectoral girdles (scapulae, clavicles), upper extremities (humerus, radius, ulna, carpals), pelvic girdle (ilium, ischium, pubis), and lower extremities (femur, patella, tibia, fibula, tarsals).

### 3. Muscular System (`z-muscular.glb`)
- **Facial & Cervical Muscles:** Frontalis, temporalis, masseter, orbicularis oris, and sternocleidomastoid.
- **Torso & Core:** Pectoralis major/minor, rectus abdominis, external obliques, latissimus dorsi, and trapezius.
- **Extremity Musculature:** Deltoid, biceps, triceps, forearm flexors/extensors, gluteal complex, quadriceps femoris, hamstrings, and gastrocnemius/soleus.

### 4. Cardiovascular System (`z-cardiovascular.glb`)
- **Arterial Circulation:** Aortic arch, common carotids, subclavian, brachial, radial/ulnar, celiac trunk, mesenteric, renal, common iliac, and femoral arteries.
- **Venous Drainage:** Superior/inferior vena cava, internal jugular, subclavian, cephalic, basilic, hepatic portal, renal, iliac, and saphenous veins.

### 5. Nervous System & Central Neural Architecture (`z-nervous.glb`)
- **Central Nervous System (CNS):** Cerebrum (12 cortical regions), cerebellum (69 billion neurons), brainstem (midbrain, pons, medulla oblongata), and the spinal cord axis.
- **Peripheral Nervous System (PNS):** Cranial nerves (I–XII), brachial plexus (C5–T1), lumbosacral plexus (L1–S4), and sciatic nerve trunk.

### 6. Integumentary System & Dermatomes (`z-skin.glb`)
- **Cutaneous Surface Envelope:** 2.0 m² external protective barrier with translucent epidermal shader for depth visualization.
- **Clinical Dermatomes (C2–S5):** Topographic sensory nerve root distribution bands mapped across head, trunk, and extremities.

---

## 🔬 Four Clinical Radiological Render Modes

1. **X-Ray Multi-Layer Hologram:**
   - Multi-layer translucent fresnel shader with custom opacities across all 6 systems simultaneously.
   - Ideal for inspecting internal organ relationships and deep nerve pathways inside the skeletal cage.
2. **Photoreal Anatomical Standard:**
   - Opaque physical medical shading reproducing physiological tissue colors (crimson muscles, ivory bone, deep red liver, azure vessels).
3. **Computed Tomography (CT Radiographic):**
   - Inverted high-contrast radiodensity attenuation where dense cortical bone appears bright white (+1000 Hounsfield Units) and soft organs attenuate in diagnostic grayscale.
4. **Magnetic Resonance Imaging (MRI Contrast):**
   - High-contrast T1/T2 gradient tissue shader emphasizing fluid interfaces, neural myelination, and visceral organ parenchyma.

---

## ⚡ Biophysical Signal Propagation Cascades

1. **Foot Stepping on Pin (Spinal Reflex Arc):** Noxious A-delta/C nociceptors → Tibial Nerve → L4–S1 Dorsal Horn (15 ms polysynaptic withdrawal reflex) → Spinothalamic Tract → Primary Somatosensory Cortex (200 ms conscious pain).
2. **Voluntary Precision Reach & Grip:** M1 Motor Strip → Corticospinal Tract → C5–T1 Cervical Cord → Brachial Plexus → Median & Radial Nerves → 50 Hz mechanoreceptor grip feedback.
3. **Acute Fight-or-Flight Alarm:** Amygdala & Hypothalamus → Thoracolumbar Sympathetic Axis → Cardiac Plexus (160 bpm) → Adrenal Epinephrine Surge → Splanchnic Vasoconstriction.
4. **Gut-Brain Serotonin Highway:** Enteric Mucosal Mechanoreceptors → Vagal Afferent Fibers (80%) → Nucleus Tractus Solitarii (NTS) in Brainstem → Limbic & Prefrontal Modulation.

---

## 🛠️ Local Development & Build Execution

```bash
# Clone the repository
git clone https://github.com/KARTHIKEYASHARMA672/neurospace.git
cd neurospace

# Install dependencies
npm install

# Start local interactive dev server
npm run dev

# Run production build and type check
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Verification & Quality Assurance Suite

- **TypeScript Strict Validation:** Compiled cleanly with zero errors via `tsc -b`.
- **Vite Production Bundler:** Production assets compiled with optimized code-splitting and asset hashing (`dist/assets/`).
- **Playwright WebGL2 Visual Suite:** Headless Chromium rendering at `1600×900` resolution capturing all 8 distinct medical system configurations and diagnostic modes.
- **Production Hosting:** Deployed on **Vercel** at `https://neurospace-3d.vercel.app` with HTTP 200 OK response across all static GLB assets.

---

## 📄 License & Attribution

- **Medical 3D Models:** Sourced from **Z-Anatomy** and **BodyParts3D** (DBCLS Japan), licensed under Creative Commons Attribution-ShareAlike (CC BY-SA 4.0 / 2.1 JP).
- **Application Code:** MIT License © 2026 Karthikeya Sharma.

# Audio credits: video-004

New files were downloaded from [Mixkit](https://mixkit.co) on 2026-11-10. Sound effects are under the Mixkit Sound Effects Free License and music under the Mixkit Stock Music Free License ([licences](https://mixkit.co/license/)). Mixkit's summary says the Free licence covers commercial projects including YouTube videos, with no attribution required. No synthesised or AI-generated music or sound effects are used.

The narration is the user's ElevenLabs recording (`projects/video-004/narration.mp3`). Audio files live in `public/` because Remotion serves media from there.

## Mix
Levels are set in `build/storyboard.cjs` from each file's measured loudness (RMS of its loudest 30 %, and its loudest 100 ms), relative to the narration measured the same way (-22.8 dB):
- Music sits 9 dB under the voice in pauses and ducks to 19 dB under while she speaks.
- One-shot effects sit at least 11 dB under the voice (their loudest moment at least 5 dB under).
- Looping ambience beds sit 17 dB under the voice.
- Impacts placed in pauses peak at least 2 to 4 dB under the voice's loudest moments.

## Sound effects (`public/sfx/zombie/`)
| File | Mixkit title | Bytes | Source |
|---|---|---|---|
| door-creak.mp3 | Creaky door open | 81995 | https://assets.mixkit.co/active_storage/sfx/195/195-preview.mp3 |
| door-knock.mp3 | Knocking on a thick wooden door | 39042 | https://assets.mixkit.co/active_storage/sfx/197/197-preview.mp3 |
| gate-open.mp3 | Scary wooden door opening | 112637 | https://assets.mixkit.co/active_storage/sfx/190/190-preview.mp3 |
| heartbeat-single.mp3 | Human single heart beat | 36640 | https://assets.mixkit.co/active_storage/sfx/490/490-preview.mp3 |
| heartbeat-transition.mp3 | Cinematic horror heartbeat transition | 1354692 | https://assets.mixkit.co/active_storage/sfx/489/489-preview.mp3 |
| horde-moan.mp3 | People moaning sadly | 1347764 | https://assets.mixkit.co/active_storage/sfx/469/469-preview.mp3 |
| horror-ambience.mp3 | Horror ambience | 2551524 | https://assets.mixkit.co/active_storage/sfx/2482/2482-preview.mp3 |
| horror-drum.mp3 | Hard horror hit drum | 122209 | https://assets.mixkit.co/active_storage/sfx/565/565-preview.mp3 |
| horror-impact.mp3 | Horror impact | 84036 | https://assets.mixkit.co/active_storage/sfx/773/773-preview.mp3 |
| marsh-wind.mp3 | Windy sea loop | 935972 | https://assets.mixkit.co/active_storage/sfx/1200/1200-preview.mp3 |
| mob.mp3 | Angry male crowd ambience | 984722 | https://assets.mixkit.co/active_storage/sfx/458/458-preview.mp3 |
| music-box.mp3 | Baby toy music box lullaby | 521440 | https://assets.mixkit.co/active_storage/sfx/700/700-preview.mp3 |
| rain-long.mp3 | Long rain ambience | 10477989 | https://assets.mixkit.co/active_storage/sfx/1247/1247-preview.mp3 |
| rain-roof.mp3 | Heavy rain over metal roof | 3452919 | https://assets.mixkit.co/active_storage/sfx/1265/1265-preview.mp3 |
| scary-wind.mp3 | Scary wind | 1670999 | https://assets.mixkit.co/active_storage/sfx/1162/1162-preview.mp3 |
| slow-heartbeat.mp3 | Slow heartbeat | 1302236 | https://assets.mixkit.co/active_storage/sfx/494/494-preview.mp3 |
| terror-sweep.mp3 | Terror sweep of darkness | 212210 | https://assets.mixkit.co/active_storage/sfx/2630/2630-preview.mp3 |
| thunder-close.mp3 | Strong close thunder explosion | 272994 | https://assets.mixkit.co/active_storage/sfx/1300/1300-preview.mp3 |
| thunder-mid.mp3 | Mid strength single thunder | 326422 | https://assets.mixkit.co/active_storage/sfx/1298/1298-preview.mp3 |
| tomb-ambience.mp3 | Creepy tomb ambience | 999223 | https://assets.mixkit.co/active_storage/sfx/2500/2500-preview.mp3 |
| whoosh-impact.mp3 | Cinematic whoosh deep impact | 115904 | https://assets.mixkit.co/active_storage/sfx/1143/1143-preview.mp3 |
| wind-howl.mp3 | Abstract wind howl interior | 838713 | https://assets.mixkit.co/active_storage/sfx/1275/1275-preview.mp3 |
| zombie-breath.mp3 | Single zombie breath | 66709 | https://assets.mixkit.co/active_storage/sfx/2233/2233-preview.mp3 |
| zombie-gasp.mp3 | Gasping zombie | 62217 | https://assets.mixkit.co/active_storage/sfx/963/963-preview.mp3 |
| zombie-growl.mp3 | Zombie monster growl | 98956 | https://assets.mixkit.co/active_storage/sfx/1973/1973-preview.mp3 |

`scary-wind.mp3` was downloaded but is not used in the current cut.

## Music (`public/music/zombie/`)
| File | Mixkit title | Artist | Used for | Bytes | Source |
|---|---|---|---|---|---|
| echoes.mp3 | Echoes | Andrew Ev | Hook and the world after | 9052021 | https://assets.mixkit.co/music/188/188.mp3 |
| piano-horror.mp3 | Piano Horror | Francisco Alvear | The Quiet One | 3617898 | https://assets.mixkit.co/music/671/671.mp3 |
| night-sky.mp3 | Staring at the Night Sky | Alejandro Magaña (A. M.) | Something unexpected (the trust) | 4544958 | https://assets.mixkit.co/music/168/168.mp3 |
| dark-shadows.mp3 | Dark Shadows | Ahjay Stelino | The impossible pregnancy, the council | 3398179 | https://assets.mixkit.co/music/64/64.mp3 |
| fright-night.mp3 | Fright Night | Michael Ramir C. | The birth | 3243407 | https://assets.mixkit.co/music/871/871.mp3 |
| delirium.mp3 | Delirium | Eugenio Mininni | Something new, feared by both | 9269797 | https://assets.mixkit.co/music/605/605.mp3 |
| silent-descent.mp3 | Silent Descent | Eugenio Mininni | The secret in the blood, the choice | 5134509 | https://assets.mixkit.co/music/614/614.mp3 |

Reused from video-003: `public/music/tech/drawing-the-sky.mp3` (Mixkit "Drawing the Sky", https://assets.mixkit.co/music/606/606.mp3) for the revelation and ending.

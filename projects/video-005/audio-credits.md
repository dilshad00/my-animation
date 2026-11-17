# Audio credits: video-005

No new audio was downloaded for this video. Every music track and sound effect is reused from earlier videos and was originally downloaded from [Mixkit](https://mixkit.co): sound effects under the Mixkit Sound Effects Free License, music under the Mixkit Stock Music Free License ([licences](https://mixkit.co/license/)). Both allow commercial use, including YouTube, with no attribution required. No synthesised or AI-generated music or sound effects are used.

The narration (`projects/video-005/narration.mp3`) is a free text-to-speech voice made on GitHub Actions with Chatterbox (MIT licence, Resemble AI), cloning a reference read by Kokoro-82M (Apache-2.0, voice am_michael). See `.github/workflows/voice.yml` and `scripts/tts/narrate.py`.

## Mix
Levels are set in `build/storyboard.cjs` from each file's measured loudness (RMS of its loudest 30 %, and its loudest 100 ms), relative to the narration measured the same way (-13.4 dB, peak -8.2 dB):
- Music sits 11 dB under the voice in pauses and ducks to 21 dB under while it speaks.
- One-shot effects sit at least 14 dB under the voice (their loudest moment at least 8 dB under).
- Looping ambience beds sit at least 20 dB under the voice.
- Impacts peak at least 8 dB under the voice's loudest moments.

## Sound effects (`public/sfx/zombie/`, from video-004)
| File | Mixkit title | Bytes | Source |
|---|---|---|---|
| door-creak.mp3 | Creaky door open | 81995 | https://assets.mixkit.co/active_storage/sfx/195/195-preview.mp3 |
| door-knock.mp3 | Knocking on a thick wooden door | 39042 | https://assets.mixkit.co/active_storage/sfx/197/197-preview.mp3 |
| heartbeat-single.mp3 | Human single heart beat | 36640 | https://assets.mixkit.co/active_storage/sfx/490/490-preview.mp3 |
| horde-moan.mp3 | People moaning sadly | 1347764 | https://assets.mixkit.co/active_storage/sfx/469/469-preview.mp3 |
| horror-ambience.mp3 | Horror ambience | 2551524 | https://assets.mixkit.co/active_storage/sfx/2482/2482-preview.mp3 |
| horror-drum.mp3 | Hard horror hit drum | 122209 | https://assets.mixkit.co/active_storage/sfx/565/565-preview.mp3 |
| horror-impact.mp3 | Horror impact | 84036 | https://assets.mixkit.co/active_storage/sfx/773/773-preview.mp3 |
| mob.mp3 | Angry male crowd ambience | 984722 | https://assets.mixkit.co/active_storage/sfx/458/458-preview.mp3 |
| rain-long.mp3 | Long rain ambience | 10477989 | https://assets.mixkit.co/active_storage/sfx/1247/1247-preview.mp3 |
| scary-wind.mp3 | Scary wind | 1670999 | https://assets.mixkit.co/active_storage/sfx/1162/1162-preview.mp3 |
| slow-heartbeat.mp3 | Slow heartbeat | 1302236 | https://assets.mixkit.co/active_storage/sfx/494/494-preview.mp3 |
| terror-sweep.mp3 | Terror sweep of darkness | 212210 | https://assets.mixkit.co/active_storage/sfx/2630/2630-preview.mp3 |
| tomb-ambience.mp3 | Creepy tomb ambience | 999223 | https://assets.mixkit.co/active_storage/sfx/2500/2500-preview.mp3 |
| whoosh-impact.mp3 | Cinematic whoosh deep impact | 115904 | https://assets.mixkit.co/active_storage/sfx/1143/1143-preview.mp3 |
| wind-howl.mp3 | Abstract wind howl interior | 838713 | https://assets.mixkit.co/active_storage/sfx/1275/1275-preview.mp3 |
| zombie-breath.mp3 | Single zombie breath | 66709 | https://assets.mixkit.co/active_storage/sfx/2233/2233-preview.mp3 |
| zombie-growl.mp3 | Zombie monster growl | 98956 | https://assets.mixkit.co/active_storage/sfx/1973/1973-preview.mp3 |

## Music (`public/music/zombie/`, from video-004)
| File | Mixkit title | Bytes | Source |
|---|---|---|---|
| dark-shadows.mp3 | Dark Shadows | Ahjay Stelino | The impossible pregnancy, the council | 3398179 | https://assets.mixkit.co/music/64/64.mp3 |
| delirium.mp3 | Delirium | Eugenio Mininni | Something new, feared by both | 9269797 | https://assets.mixkit.co/music/605/605.mp3 |
| echoes.mp3 | Echoes | Andrew Ev | Hook and the world after | 9052021 | https://assets.mixkit.co/music/188/188.mp3 |
| fright-night.mp3 | Fright Night | Michael Ramir C. | The birth | 3243407 | https://assets.mixkit.co/music/871/871.mp3 |
| night-sky.mp3 | Staring at the Night Sky | Alejandro Magaña (A. M.) | Something unexpected (the trust) | 4544958 | https://assets.mixkit.co/music/168/168.mp3 |
| piano-horror.mp3 | Piano Horror | Francisco Alvear | The Quiet One | 3617898 | https://assets.mixkit.co/music/671/671.mp3 |
| silent-descent.mp3 | Silent Descent | Eugenio Mininni | The secret in the blood, the choice | 5134509 | https://assets.mixkit.co/music/614/614.mp3 |

Also `public/music/tech/drawing-the-sky.mp3` (Mixkit "Drawing the Sky", https://assets.mixkit.co/music/606/606.mp3), from video-003, for Day Forty.

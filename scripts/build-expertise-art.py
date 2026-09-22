#!/usr/bin/env python3
"""Build original, deterministic pen drawings for the Expertise atlas.
No external images, icon libraries, tracing, or runtime drawing dependencies.
Edit the named object functions below; run from the repository root.
"""
from pathlib import Path
import math, random
R=random.Random(17377)
OUT=Path('assets/images/expertise'); OUT.mkdir(parents=True, exist_ok=True)
INK='#173A77'; PAPER='#F3EEE3'

def path(d, w=1, opacity=1, fill='none', extra=''):
    return f'<path d="{d}" stroke-width="{w}" opacity="{opacity}" fill="{fill}" {extra}/>'
def line(x,y,a,b,w=.8,o=.7):
    return path(f'M{x:.1f} {y:.1f} Q{(x+a)/2+R.uniform(-.8,.8):.1f} {(y+b)/2+R.uniform(-.8,.8):.1f} {a:.1f} {b:.1f}',w,o)
def ellipse(x,y,rx,ry,w=1,fill='none',o=1):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" stroke-width="{w}" fill="{fill}" opacity="{o}"/>'
def rect(x,y,w,h,fill='none',sw=1):
    return path(f'M{x} {y} l{w} .4 -.5 {h} -{w} -.4 Z',sw,1,fill)
def group(s,x=0,y=0,scale=1,rotate=0):
    return f'<g transform="translate({x} {y}) scale({scale}) rotate({rotate})">{s}</g>'
def hatch(x,y,w,h,step=5,slant=8,o=.45):
    return ''.join(line(x+i,y,x+i+slant,y+h,.65,o) for i in range(0,int(w),step))
def terrain(x,y,w=260,n=40):
    s=''
    for _ in range(n):
        a=x+R.random()*w; b=y+R.random()*35; ll=R.uniform(3,24)
        s+=path(f'M{a:.1f} {b:.1f} q{ll/2:.1f} {-R.random()*3:.1f} {ll:.1f} -1',.6,R.uniform(.2,.65))
    return s

def bird(x=0,y=0,s=1):
    return group(path('M0 4 Q-14 -14 -27 -6 Q-11 -4 0 4 Q15 -10 26 -2 Q12 -3 0 4 M-2 4 l4 5 3 -4',1.1),x,y,s)
def figure(x=0,y=0,s=1):
    f=ellipse(11,7,4.4,6,1,PAPER)+path('M8 13 Q0 23 3 40 L11 43 18 38 Q20 20 14 14 M5 20 L-4 35 -1 38 8 28 M16 20 L25 31 28 24 M7 41 L4 63 0 65 M14 42 L19 61 24 63',1.3,1,PAPER)+hatch(7,18,7,20,3,1)
    return group(f,x,y,s)
def cypress(x,y,s=1):
    p=path('M0 126 Q-4 80 0 18 M0 109 C-33 107 -30 92 -24 80 C-35 68 -19 54 -20 43 Q-11 15 1 0 Q19 23 20 44 C36 65 27 72 29 86 Q34 113 0 109',.8,.85)
    for _ in range(110):
        yy=R.uniform(15,110); xx=R.uniform(-1,1)*min(25,yy*.35)
        p+=path(f'M{xx:.1f} {yy:.1f} l{R.uniform(-5,4):.1f} {R.uniform(3,9):.1f}',.6,R.uniform(.25,.7))
    return group(p,x,y,s)
def tree(x,y,s=1):
    p=path('M0 155 Q-4 108 3 72 M5 156 Q8 103 10 68 M3 115 L-31 76 M7 106 L37 67 M1 98 L-9 40 M8 89 L25 39',1.6)
    for cx,cy,rr in [(-28,58,29),(-7,31,31),(22,29,26),(41,57,29),(4,67,31)]:
        p+=path(f'M{cx-rr} {cy} q-5 -21 14 -25 q13 -18 28 -4 q24 -1 23 24 q10 21 -17 27 q-30 15 -48 -7',.8,.7)
        for _ in range(45):
            a=R.uniform(0,math.tau); r=R.random()*rr
            xx=cx+math.cos(a)*r; yy=cy+math.sin(a)*r
            p+=path(f'M{xx:.1f} {yy:.1f} q3 -4 6 -2',.55,.55)
    return group(p,x,y,s)
def steps(x,y,w,n=5):
    return ''.join(path(f'M{x-i*5} {y+i*7} h{w+i*10} v5 h-{w+i*10}',.85,.85,PAPER) for i in range(n))

def mirror():
    s=terrain(20,330,305,100)
    s+=path('M73 303 L57 320 249 324 278 306 259 300 Z',1,1,PAPER)
    s+=path('M86 287 L80 309 101 312 108 292 M219 290 L218 312 240 313 240 290',1.4,1,PAPER)
    # A slightly leaning architectural mirror, with an impossible horizon inside.
    s+=path('M75 292 L69 83 C63 -8 251 -6 253 80 L265 294 Z',2,1,PAPER)
    s+=path('M85 280 L80 84 C76 10 240 9 241 82 L252 281 Z',.85)
    s+=path('M93 271 L90 86 C85 25 229 20 231 85 L240 272 Z',1.3)
    for i in range(28):
        ang=math.pi+i*math.pi/27; x=163+86*math.cos(ang);y=86+78*math.sin(ang)
        s+=line(x,y,163+76*math.cos(ang),86+67*math.sin(ang),.75,.8)
    s+=hatch(72,101,10,175,3,7,.65)+hatch(244,97,10,178,3,8,.6)
    s+=path('M97 216 Q142 183 172 212 Q206 186 236 214 M97 225 Q140 210 175 228 T237 224 M125 269 Q157 233 195 219',.8,.75)
    for i in range(12): s+=line(98,231+i*3,235,231+i*3,.5,.38)
    s+=path('M114 143 Q151 112 201 140 Q160 172 114 143 M115 143 Q160 129 201 140',1.2)
    s+=ellipse(157,141,13,14,1)+ellipse(159,142,5,7,.7,INK)
    s+=path('M97 103 L122 70 M99 114 L139 61 M207 252 l17 -22 M208 262 l25 -34',.65,.4)
    s+=path('M143 15 Q147 -4 160 9 Q174 -7 181 12 M150 17 Q160 3 171 17',1)
    s+=figure(288,289,.57)+bird(39,83,.45)
    return s

def theatre():
    s=terrain(5,330,345,80)+steps(43,299,239,5)
    s+=path('M43 299 L45 100 168 30 300 103 298 299 Z',1.5,1,PAPER)
    s+=path('M31 102 L169 22 313 105 302 115 168 44 42 115 Z',1.3,1,PAPER)
    s+=path('M71 276 L72 136 Q172 74 271 138 L271 276 Z',1)
    s+=path('M80 138 Q166 102 262 139 L243 150 Q180 134 91 153 Z',.8,1,PAPER)
    s+=path('M80 145 Q109 184 93 253 L79 279 128 280 Q141 222 107 159 M263 144 Q230 189 245 255 L269 277 218 280 Q204 212 241 157',1,1,PAPER)
    for i in range(10):
        s+=path(f'M{80+i*3} 154 Q{125+i*1.3} 215 {82+i*4} 274',.6,.55)
        s+=path(f'M{258-i*3} 155 Q{215-i} 220 {263-i*4} 274',.6,.55)
    for x in [49,280]:
        s+=rect(x,124,15,164,PAPER)+hatch(x+3,131,8,151,3,0,.65)+rect(x-3,117,21,8,PAPER)+rect(x-4,286,23,10,PAPER)
    s+=ellipse(171,211,38,13)+ellipse(171,207,38,13,1,PAPER)
    s+=path('M150 221 l-8 43 M192 220 l10 44 M164 204 q-16 -10 -2 -24 q-7 -10 0 -18 q16 0 11 16 q18 18 -9 26',1.2,1,PAPER)
    s+=ellipse(181,188,9,9,1,PAPER)+path('M181 179 l8 -14 M171 64 l-3 29 M155 79 l29 -1',1)
    s+=figure(327,284,.7)
    return s

def horn():
    s=terrain(18,314,300,75)+steps(100,278,90,4)
    s+=path('M112 278 L114 224 180 220 180 278 Z M112 224 l33 -10 42 5 -8 6 M123 234 h44 M123 263 h42',1,1,PAPER)
    s+=path('M134 218 Q166 192 142 170 C123 154 136 139 153 130 L155 145 Q143 150 155 158 C190 184 166 215 158 219 Z',1.3,1,PAPER)
    s+=path('M148 139 Q185 119 250 57 L280 163 Q218 135 153 151 Z',1.6,1,PAPER)
    s+=ellipse(265,110,24,59,1.8,PAPER)
    s+=ellipse(265,110,16,47,1)
    s+=path('M251 75 Q243 116 267 152 M252 67 Q272 108 277 147',.7,.6)
    for i in range(11): s+=path(f'M154 {139+i} Q210 {125+i*1.7} {247+i*2} {62+i*9}',.65,.55)
    s+=path('M293 78 Q317 107 301 140 M305 66 Q336 109 316 153 M317 51 Q350 108 330 165',.7,.6)
    s+=path('M27 226 C36 197 47 174 37 156 Q26 140 35 132 Q47 115 53 136 Q77 146 57 164 L55 229 M38 162 l-19 30 16 -10 M49 168 l13 29 -15 -11 M37 229 l-7 78 18 -66 12 64 -5 -76 M22 309 h47',1.15,1,PAPER)
    s+=hatch(28,307,52,8,4,7)
    return s

def lighthouse():
    s=terrain(5,331,305,95)
    s+=path('M51 337 L75 307 104 315 121 291 161 301 207 282 262 308 293 340',1,.9)
    s+=path('M116 309 L133 111 192 111 212 310 Z',1.6,1,PAPER)
    s+=path('M110 311 h108 l4 9 -117 1 Z M127 111 h73 v-11 h-76 Z M134 101 l-1 -54 57 1 3 54 M122 47 l41 -31 41 33 Z M162 15 V1',1.3,1,PAPER)
    s+=rect(142,55,41,38,PAPER)+ellipse(163,73,7,15,1,INK)
    for x in [139,153,177,188]:s+=line(x,51,x,100,1)
    for y in range(131,308,15):
        left=133-(y-111)*.08;right=192+(y-111)*.10
        s+=line(left,y,right,y+.7,.5,.55)
        for x in range(int(left)+int(y%3)*7,int(right),17):s+=line(x,y,x-1,y+14,.5,.48)
    s+=path('M150 310 v-37 q15 -23 30 0 v37 M153 166 v-22 q9 -12 16 0 v22 Z M152 235 v-20 q9 -12 16 0 v20 Z',1,1,PAPER)
    s+=hatch(174,126,12,129,3,10,.65)+path('M127 115 l67 1 M125 124 l70 2',.6)
    s+=bird(52,98,.7)+bird(83,74,.4)
    return s

def observatory():
    s=terrain(0,335,340,85)+steps(38,303,263,4)
    s+=path('M50 300 V185 L292 181 V300 Z',1.3,1,PAPER)
    s+=path('M38 185 C33 69 299 49 307 182 Z',1.3,1,PAPER)
    s+=path('M41 174 Q162 153 305 172 M44 164 Q163 144 303 162 M47 154 Q173 133 299 153',.7)
    for i in range(14):
        x=48+i*19
        s+=path(f'M{x} 177 Q{155+(x-170)*.6} 64 176 87',.65,.6)
    s+=path('M148 164 L170 89 186 89 174 163 Z',1.2,1,PAPER)
    s+=path('M153 151 L180 107 274 18 287 33 193 121 166 155 Z',1.5,1,PAPER)
    s+=ellipse(280,24,13,6,1,PAPER)+hatch(184,109,15,12,3,-6)
    s+=path('M178 109 l16 15 M250 40 l15 16 M256 34 l15 17 M168 150 l17 16',.9)
    for x in [73,135,198,258]:
        s+=path(f'M{x} 291 v-66 q11 -22 23 0 v66 Z',1,1,PAPER)+hatch(x+5,227,13,61,4,0,.6)
    for y in [205,222,240,259,279]:s+=line(51,y,290,y,.55,.42)
    s+=path('M221 79 l-3 -13 m-6 5 13 -2 M321 44 l-2 -13 m-6 5 13 -2 M314 111 l-1 -12 m-6 5 13 -2',.8,.75)
    s+=ellipse(330,76,4,4,.8)+bird(36,70,.4)
    return s

def lookout():
    s=terrain(0,315,330,75)+path('M57 306 L75 222 258 223 280 307 Z M75 221 L150 188 277 215 260 229 Z',1.1,1,PAPER)
    s+=hatch(80,232,176,71,6,9,.4)
    s+=path('M149 222 L138 299 M162 223 l13 77 M155 217 l1 86',1.4)
    s+=path('M123 180 l91 -33 9 24 -93 30 Z M119 178 l12 25 -12 4 -14 -26 Z M212 142 l14 32 13 -4 -13 -32 Z',1.4,1,PAPER)
    s+=ellipse(231,154,8,17,1.3,PAPER)+hatch(128,185,53,9,4,-2,.7)
    s+=path('M150 194 l3 29 13 -1 -6 -30',1.2,1,PAPER)
    s+=figure(73,165,.85)
    s+=path('M247 195 l14 -68 m-19 72 29 -5 M260 129 l-3 -22 6 -9 6 10 -8 21',.9,1,PAPER)
    s+=ellipse(161,320,113,13,.6,'none',.5)
    return s

def table():
    s=terrain(0,306,345,90)
    s+=path('M46 165 L185 97 324 172 185 248 Z',1.6,1,PAPER)
    s+=path('M46 165 v13 l138 77 140 -71 v-12 M69 189 v112 l10 7 9 -7 4 -99 M276 209 l-3 93 11 8 8 -13 2 -99 M175 250 v67 l12 3 7 -8 -1 -62',1.2,1,PAPER)
    s+=path('M77 166 L183 116 296 171 184 226 Z',.8)
    s+=path('M93 166 Q150 172 182 133 M124 191 Q145 159 226 150 M149 206 Q183 183 263 174 M186 208 l18 -29 43 -20',.8,.7)
    s+=path('M161 166 l22 -35 18 40 -23 30 Z M161 166 l40 5 M183 132 l-5 69',.85)
    s+=ellipse(185,165,11,6,.7)
    s+=path('M251 150 l10 -47 7 -1 2 56 M253 129 l13 2 M259 103 l6 -6',1.1,1,PAPER)
    s+=path('M58 155 q-12 -20 3 -22 l91 -38 q18 -3 10 12 l-87 36 q-9 14 -17 12',1,1,PAPER)
    s+=path('M62 134 q15 11 2 20 M78 139 l80 -34',.7)
    s+=figure(322,212,1.2)
    return s

def intervention():
    s=terrain(0,323,340,100)
    s+=path('M19 333 Q82 271 72 215 Q61 161 158 119 Q198 101 189 40 M37 335 Q108 268 87 209 Q70 174 169 131 Q216 112 205 42',1,.8)
    s+=path('M163 312 l12 -233 M172 90 Q212 52 267 73 l-24 24 25 25 Q218 96 171 127 Z',1.4,1,PAPER)
    s+=path('M181 99 Q210 86 236 89 M184 108 Q211 98 228 105',.65)
    s+=path('M249 313 l-14 -137 47 -5 16 139 Z',1.2,1,PAPER)
    s+=path('M242 189 l35 -5 8 70 -36 4 Z',.85,1,PAPER)
    s+=path('M250 204 l22 -2 M250 209 l23 -2 M258 221 l5 14 8 -22 M256 245 l20 -2',.8)
    s+=path('M110 265 l-11 -8 m7 -7 -11 -6 m13 -12 -10 -7 m6 -13 -8 -7 m3 -10 -9 -8',1.1)
    s+=figure(82,176,.72)+bird(274,58,.7)
    s+=path('M32 193 Q12 141 33 124 Q49 102 32 92 M37 165 Q26 147 43 133',.75,.5)
    return s

def correspondence():
    s=terrain(0,316,350,80)
    s+=path('M30 300 l8 -266 7 -1 2 266 M8 54 h64 M14 70 h55 M285 304 l-4 -244 9 -1 10 245 M265 79 h48 M267 94 h48',1.35,1,PAPER)
    s+=path('M32 52 Q146 159 293 80 M34 66 Q151 177 294 94',1.05)
    s+=ellipse(41,57,10,14,1.2,PAPER)+ellipse(285,86,10,14,1.2,PAPER)
    for x,y,rot in [(82,105,25),(163,132,0),(240,115,-15)]:
        e=rect(-18,0,39,26,PAPER)+path('M-18 1 L2 16 21 1 M-17 25 L-2 13 M21 26 L8 12',.7)+line(2,-17,2,0,.8)
        s+=group(e,x,y,1,rot)
    s+=path('M97 299 v-62 l123 -4 v66 Z M90 237 l70 -39 70 34 -8 11 Z M118 297 v-43 h34 v43 M172 257 h29 v20 h-29 Z',1.15,1,PAPER)
    s+=hatch(157,246,10,51,3,0,.6)+path('M147 219 h32 M36 286 l-13 14 M291 286 l20 15',1)
    s+=bird(165,66,.6)+bird(204,32,.35)
    return s

def signal():
    s=terrain(0,324,330,80)+steps(68,292,160,4)
    s+=path('M86 290 V84 M105 291 V86 M199 290 V82 M217 290 V81 M77 91 l149 -5 v-13 L78 76 Z',2,1,PAPER)
    s+=hatch(88,98,12,186,4,0,.7)+hatch(203,98,9,187,3,0,.7)
    s+=path('M149 86 v27 M113 185 Q129 168 127 139 Q130 110 153 111 Q175 111 178 138 Q175 164 196 183 Z',1.5,1,PAPER)
    s+=ellipse(154,184,42,9,1.3,PAPER)+ellipse(154,188,7,10,1,PAPER)
    s+=path('M140 119 Q130 152 127 174 M135 127 Q138 144 133 163 M179 141 Q196 213 247 254',.9)
    s+=path('M75 132 Q61 148 70 170 M57 117 Q37 146 51 182 M222 130 Q234 143 225 162',.8,.6)
    s+=figure(261,244,.94)+path('M267 270 L248 255',1)
    return s

def bridge():
    s=terrain(0,319,350,110)
    s+=path('M8 250 L83 226 155 232 222 210 335 221 L334 298 297 309 V271 Q276 239 255 271 V318 L207 321 V278 Q187 247 167 281 V324 L119 321 V284 Q96 250 74 278 V315 L28 304 9 309 Z',1.4,1,PAPER)
    s+=path('M7 240 L81 216 154 222 220 200 335 211 v12 L222 213 155 234 82 227 8 253 Z',1.2,1,PAPER)
    for y in range(247,315,13):
        for a,b in [(29,63),(122,151),(210,240),(302,332)]: s+=line(a,y,b,y-2,.55,.6)
    for x in [29,47,126,143,214,233,309,325]:s+=line(x,244,x,311,.55,.4)
    s+=path('M181 245 V95 M208 252 V99 M178 95 l104 -23 M168 128 l118 -25 M169 162 l122 -26 M171 201 l126 -28 M273 213 V60 M294 218 V58 M176 95 l112 121 M173 203 l108 -132',1,.85)
    s+=path('M198 93 l60 -77 36 55 M239 41 l63 -18 M297 24 v83 l-13 12 M290 118 h19 v23 h-19 Z',1.2,1,PAPER)
    s+=hatch(292,122,12,15,3,0,.7)
    s+=figure(105,179,.7)+path('M35 333 Q144 302 203 342 T343 341',.65,.5)
    return s

def press():
    s=terrain(0,331,345,90)+steps(44,304,244,3)
    s+=path('M73 302 L73 44 91 42 95 302 M256 304 L254 42 273 44 272 306 M65 45 l217 -1 -1 -18 -217 2 Z M90 88 h167 v16 H92 Z',1.5,1,PAPER)
    s+=hatch(76,56,10,240,3,0,.65)+hatch(258,54,10,245,3,0,.65)
    s+=path('M163 49 v105 h21 V47 M136 156 l72 -2 v13 l-71 2 Z M111 212 l121 -2 25 23 -159 4 Z M109 239 v64 M242 239 v66',1.3,1,PAPER)
    for y in range(56,145,6):s+=line(164,y,183,y-4,1,.8)
    s+=path('M175 118 l61 -33 M230 81 l12 12 M171 111 l-29 18',1.6)
    s+=path('M119 211 Q170 197 225 213 Q248 253 213 268 Q185 297 270 303 L252 323 Q173 315 188 277 Q210 252 195 239 L113 239 Z',1.15,1,PAPER)
    for y in range(216,234,4):s+=line(135,y,194,y,.7,.65)
    s+=path('M211 280 l22 8 M205 287 l31 11 M210 296 l32 9 M223 307 l23 7',.75)
    s+=figure(17,245,1)+bird(309,84,.5)
    return s

OBJECTS={'mirror':mirror,'theatre':theatre,'horn':horn,'lighthouse':lighthouse,'observatory':observatory,'lookout':lookout,'table':table,'intervention':intervention,'correspondence':correspondence,'signal':signal,'bridge':bridge,'press':press}
def svg(body,view='0 0 360 370'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" fill="none" stroke="{INK}" stroke-linecap="round" stroke-linejoin="round">{body}</svg>'
for name,fn in OBJECTS.items(): (OUT/f'{name}.svg').write_text(svg(fn()))

# One sinuous watercourse continues at exactly the same coordinate between plates.
# Sloping banks, terraces and aerial transmission lines create the composition.
for plate in range(4):
    s=''
    yoff=plate*820
    def river(t): return 730+250*math.sin((t+yoff)/520)
    for j in range(8):
        pts=[]
        for y in range(-20,851,12):
            x=river(y)+j*5+math.sin(y/67+j)*2
            pts.append(f'{x:.1f} {y}')
        s+=path('M'+' L'.join(pts),.55,.23 if j not in [0,7] else .55)
    # Contours occupy distinct strips; broad areas remain unmarked for text.
    for zone in range(3):
        base=190+zone*253
        for k in range(9):
            yy=base+k*8
            s+=path(f'M-30 {yy+50} C180 {yy-30} 260 {yy+20} 430 {yy-5} S730 {yy-40} 925 {yy+25} S1230 {yy+55} 1480 {yy-20}',.55,.13+(k%3)*.035)
    # Tiny parallel field marks give the open landscape a colored-pencil surface.
    for _ in range(220):
        x=R.uniform(0,1440);y=R.uniform(170,820)
        if abs(x-river(y))<70:continue
        length=R.uniform(3,24)
        s+=line(x,y,x+length,y-R.uniform(0,3),.55,R.uniform(.13,.3))
    if plate==0:
        s+=path('M260 380 Q390 394 634 533 T1129 354',1,.43)
        s+=path('M262 385 Q390 403 630 542 T1133 361',.65,.4)
        s+=tree(1390,370,1.2)+cypress(53,431,.55)+bird(844,46,.7)+bird(790,60,.38)
    elif plate==1:
        s+=path('M306 124 L799 36 M307 133 L861 313',.7,.26)
        s+=path('M620 622 L1180 169 M625 628 L1150 166',.7,.25,extra='stroke-dasharray="4 9"')
        s+=cypress(39,580,.9)+cypress(1360,348,1.1)+cypress(1338,360,.7)
    elif plate==2:
        s+=path('M242 360 Q358 435 541 294 Q737 94 1133 182',.9,.4)
        s+=path('M248 368 Q365 451 551 303 Q740 107 1133 190',.65,.38)
        s+=path('M779 647 Q1150 626 1490 526',.8,.4)
        s+=tree(1300,624,.8)+cypress(53,205,.7)
    else:
        s+=path('M251 293 Q437 269 750 233 M602 683 Q796 758 1016 764',.8,.4)
        s+=tree(1280,569,1.3)+cypress(1237,655,.8)+cypress(1390,690,.65)
    (OUT/f'ground-{plate+1}.svg').write_text(svg(s,'0 0 1440 820'))

# The far edge: an inhabited estuary, a bridge, a waiting boat, an open horizon.
s=''
for k in range(29):
    y=430+k*9
    s+=path(f'M-20 {y} Q230 {y-42} 470 {y+1} T960 {y+13} T1470 {y-8}',.65,.14+(k%4)*.025)
# Distant city drawn as a continuous uneven silhouette.
for i in range(21):
    x=385+i*30; y=472+R.uniform(-12,14);h=R.uniform(15,65);ww=R.uniform(20,30)
    s+=path(f'M{x} {y} v-{h} l{ww/2} -{ww/2} {ww/2} {ww/2} v{h}',.75,.6,PAPER)
    for wx in [x+7,x+16]:s+=path(f'M{wx} {y-h+11} v7 M{wx} {y-h+27} v7',.8,.55)
s+=group(lighthouse(),900,324,.36)
s+=path('M0 601 Q196 458 386 562 Q513 634 745 582 Q1131 490 1460 537 L1460 820 H0 Z',1,.75,PAPER)
for _ in range(1250):
    x=R.uniform(0,1440);y=R.uniform(565,808)
    # Winding unmarked path across the foreground.
    road=710+260*math.sin((y-580)/140)
    if abs(x-road)<40:continue
    s+=line(x,y,x+R.uniform(2,18),y+R.uniform(-4,0),.55,R.uniform(.16,.55))
s+=path('M674 820 Q1128 699 749 586 M795 820 Q1145 710 784 584',.95,.6)
s+=tree(41,399,1.65)+tree(117,438,1.05)+cypress(216,449,1.05)+cypress(248,497,.72)
s+=tree(1314,355,1.9)+cypress(1194,456,1.25)+cypress(1240,424,1.3)+tree(1450,467,1.1)
s+=group(bridge(),400,537,.59)
s+=figure(841,707,.6)+figure(883,696,.55)+bird(737,326,.7)+bird(792,301,.5)
s+=path('M1012 504 q62 17 113 -3 l-18 22 -70 3 Z M1061 505 v-67 l37 54 Z M1061 439 l-28 54 28 2',1,.8,PAPER)
(OUT/'estuary.svg').write_text(svg(s,'0 0 1440 820'))
# Sparse paper fibers, tiled at a deliberately very low CSS opacity.
paper=''.join(line(R.randrange(180),R.randrange(180),R.randrange(180),R.randrange(180),.3,.2) for _ in range(28))
(OUT/'paper.svg').write_text(svg(paper,'0 0 180 180'))
print('Built',len(list(OUT.glob('*.svg'))),'original SVG drawings.')

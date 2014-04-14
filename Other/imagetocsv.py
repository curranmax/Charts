import Image
import csv
import os
import sys
from numpy import *

baseOutfile="C:/Users/curram2/Documents/Junior/Charts/Images/"
eps=.000000001
inFun=raw_input

def run(filename,outfile,xbin,ybin):
    im=readImage(filename,filepath)
    np=binImage(im,xbin,ybin)
    writeImageData(np,outfile)

def writeImageData(pixels,filename):
    f=open(filename,'w')
    csvw=csv.writer(f,lineterminator='\n')
    csvw.writerow(['R','G','B'])
    for p in pixels:
        csvw.writerow(p)

def binImage(im,xbin,ybin):
    pix=im.load()
    seen=array([[0]*im.size[1]]*im.size[0])
    newpixels=[0]*(xbin*ybin)
    num=[0]*(xbin*ybin)
    for x in range(im.size[0]):
        i=floor(float(x)/im.size[0]*xbin+eps)
        for y in range(im.size[1]):
            j=floor(float(y)/im.size[1]*ybin+eps)
            newpixels[int(i*ybin+j)]+=double(pix[x,y])
            num[int(i*ybin+j)]+=1
    for i in range(xbin*ybin):
        newpixels[i]=(newpixels[i]/num[i]).tolist()
    return newpixels

def dzero(a,b):
    if(b==0):
        return 0
    else:
        return a/b

def isImagefile(filename):
    if(filename[-4:]=='.jpg'):
        return (True,filename[:-4])
    if(filename[-4:]=='.png'):
        return (True,filename[:-4])
    return (False,"")

def interactiveRun(d='C:/Users/curram2/Pictures'):
    d=Directory(d)
    d.lookThroughSelf()
    while(True):
        d.display()
        inp=inFun('Select -1 to go up, or a number to selct that file, and anything else to end\n')
        try:
            int(inp)
        except Exception, e:
            print "end"
            return
        if(int(inp)==-1):
            if(d.parent==None):
                print "Top Level Can't go any higher"
            else:
                print "parent"
                d=d.parent
        elif(int(inp)>=0 and int(inp)<len(d.children)):
            d=d.children[int(inp)].enter()
        else:
            print "end"
            return

class CustomFile:
    def __init__(self,n):
        self.name=n
    def getShortName(self):
        s=""
        for i in self.name[::-1]:
            if(i=='\\' or i=='/'):
                return s[::-1]
            s+=i
        return s[::-1]

class Directory(CustomFile):
    def __init__(self,direct,p=None):
        self.name=direct
        self.children=[]
        self.parent=p
        self.hasimages=False

    def lookThroughSelf(self):
        files=os.listdir(self.name)
        for f in files:
            (yn,name)=isImagefile(f)
            if os.path.isdir(self.name+'/'+f):
                nd=Directory(self.name+'/'+f,self)
                self.children.append(nd)
                nd.lookThroughSelf()
            elif yn:
                self.hasimages=True
                self.children.append(CustomImage(self.name+'/'+f,name,self))
    
    def containImage(self):
        if(self.hasimages):
            return True
        for c in self.children:
            if isinstance(c,Directory):
                if(c.containImage()):
                    return True
        return False

    def enter(self):
        if self.containImage():
            return self
        else:
            print "Does Not have any valid image files"
            return self.parent

    def displayAll(self,t=0):
        if self.containImage():
            print '\t'*t+'Directory Name: \t'+self.getShortName()
            for c in self.children:
                c.displayAll(t+1)

    def display(self,t=0,n=-1):
        print '\t'*t+str(n)+':'+' Parent Directory Name: \t'+self.getShortName()
        for c in self.children:
            if c.containImage():
                c.shortDisplay(t+1,n+1)
            n+=1

    def shortDisplay(self,t,n):
        print '\t'*t+str(n)+': '+'Directory Name: \t'+self.getShortName()

class CustomImage(CustomFile):
    def __init__(self,f,sn,p):
        self.name=f
        self.parent=p
        self.sn=sn
        self.im=None
        self.options=[ImageToCSV(sn),ImageModifier(),ASCIIArt()]

    def enter(self):
        print "\n\n"+self.getShortName()
        self.readImage()
        print "Here are the options to modify the image"
        for i,o in enumerate(self.options):
            print str(i)+": \t"+o.getDescrip()
        o=inFun("Please enter the number corresponding to the desired function\n")
        try:
            int(o)
        except Exception,e:
            print "Error in input"
            return self.parent
        self.options[int(o)].execute(self.im)
        return self.parent

    def displayAll(self,t):
        s='\t'*t
        s+='Image Name:     \t'+self.getShortName()
        print s

    def containImage(self):
        return True

    def display(self):
        print 'Image Name:     \t'+self.getShortName()

    def shortDisplay(self,t,n):
        s='\t'*t+str(n)+': '+'Image Name:     \t'+self.getShortName()
        print s

    def readImage(self):
        if(self.im==None):
            self.im=Image.open(self.name)

class ImageToCSV:
    def __init__(self,sn):
        self.outFile="C:/Users/curram2/Documents/Junior/Charts/Images/"
        self.sn=sn

    def getDescrip(self):
        return "Image to CSV"

    def execute(self,im):
        print"------------------Image To CSV------------------"
        print "X: "+str(im.size[0])
        print "Y: "+str(im.size[1])
        xbin=inFun("Bins in the x direction\n")
        ybin=inFun("Bins in the y direction\n")
        try:
            int(xbin)
            int(ybin)
        except Exception, e:
            print "-------------------Error in input-------------------"
            return
        print "Binning Image..."
        np=binImage(im,int(xbin),int(ybin))
        print "Binned Image!\nWriting Data..."
        writeImageData(np,self.outFile+self.sn+"X"+xbin+"Y"+ybin+".csv")
        print "Image Successfully Written to "+self.outFile+self.sn+"X"+xbin+"Y"+ybin+".csv"
        print"----------------End Image To CSV----------------"

class PixelWiseModification:
    def __init__(self):
        self.maxValue={"R":255,"G":255,"B":255}
        self.minValue={"R":0,"G":0,"B":0}
        self.scale=[]
        self.offset=[]
        self.bands=[]

    def getDescrip(self):
        return "Modify Each Pixel by a set equation"

    def getConstants(self,vals,typeFuns):
        out=""
        for i,v in enumerate(vals):
            out+=v+","
        ret=eval(inFun(out[:-1]+"\n"))
        newret=[]
        for i,v in enumerate(ret):
            try:
                newret.append(typeFuns[i](v))
            except Exception, e:
                print "-------------------Error in input-------------------"
                return
        return tuple(newret)

    def getConstantsForEachBand(self,bands,vals,typeFuns):
        lists=[]
        for v in vals:
            lists.append([])
        for b in bands:
            print ""
            print b
            try:
                v=self.getConstants(vals,typeFuns)
            except Exception, e:
                return
            for i,val in enumerate(v):
                lists[i].append(val)
        return tuple(lists)

    def getNextPixel(self,p,x,y):
        np=[]
        for i,v in enumerate(p):
            nv=v*self.scale[i]+self.offset[i]
            if nv>self.maxValue[self.bands[i]]:
                nv=self.maxValue[self.bands[i]]
            if nv<self.minValue[self.bands[i]]:
                nv=self.minValue[self.bands[i]]
            np.append(int(nv))
        return tuple(np)

    def setConstants(self):
        self.scale,self.offset=self.getConstantsForEachBand(self.bands,("scale","offset"),(float,float))

    def getBeginText(self):
        return "------------------Pixel Wise Modification------------------"

    def getExplainInputText(self):
        return "For each band enter values separated by commas for the following function:\npixelvalue * scale + offset"  

    def getEndText(self):
        return "----------------End Pixel Wise Modification----------------"

    def execute(self,im):
        print self.getBeginText()
        imcopy=im.copy()
        self.bands=imcopy.getbands()
        print self.getExplainInputText()
        self.setConstants()
        pix=imcopy.load()
        for x in range(im.size[0]):
            for y in range(im.size[1]):
                p=pix[x,y]
                pix[x,y]=self.getNextPixel(p,x,y)
        print self.getEndText()
        return imcopy

class BlackAndWhite(PixelWiseModification):
    def __init__(self):
        self.maxValue={"R":255,"G":255,"B":255}
        self.minValue={"R":0,"G":0,"B":0}
        self.rscalar=0
        self.gscalar=0
        self.bscalar=0
        self.bands=[]

    def getNextPixel(self,p,x,y):
        nv=p[0]*self.rscalar+p[1]*self.gscalar+p[2]*self.bscalar
        if nv>255:
            nv=255
        if nv<0:
            nv=0
        return tuple([int(nv)]*len(p))

    def setConstants(self):
        self.rscalar,self.gscalar,self.bscalar=self.getConstants(("R","G","B"),(float,float,float))

    def getBeginText(self):
        return "------------------Black And White------------------"

    def getExplainInputText(self):
        return "Enter three values to combine pixel into one value"  

    def getEndText(self):
        return "----------------End Black And White----------------"

    def getDescrip(self):
        return "Make The Image Black And White"

class PresetBlackAndWhite(BlackAndWhite):
    def setConstants(self):
        self.rscalar,self.gscalar,self.bscalar=(.2989,.5870,.1140)

    def getBeginText(self):
        return "------------------Preset Black And White------------------"

    def getExplainInputText(self):
        return ""  

    def getEndText(self):
        return "----------------End Preset Black And White----------------"

    def getDescrip(self):
        return "Make The Image Black And White using Preset Constants"

class DistanceBasedModification(PixelWiseModification):
    def __init__(self):
        self.maxValue={"R":255,"G":255,"B":255}
        self.minValue={"R":0,"G":0,"B":0}
        self.sigma=0
        self.scale=[]
        self.offset=[]
        self.bands=[]
        self.xc=0
        self.yc=0

    def getBeginText(self):
        return "------------------Distance Based Modification------------------"

    def getExplainInputText(self):
        return "First Enter the Center Point and sigma. Then For each band enter values separated by commas for the following function:\n(pixelvalue * scale + offset)*c+pixelvalue*(1-c) where c is exp(-.5(distance/sigma)^2)"  

    def getEndText(self):
        return "----------------End Distance Based Modification----------------"

    def getDescrip(self):
        return "Color the Image based on the distance from a single point"

    def setConstants(self):
        self.xc,self.yc,self.sigma=self.getConstants(("xcenter","ycenter","sigma"),(float,float,float))
        self.scale,self.offset=self.getConstantsForEachBand(self.bands,("scale","offset"),(float,float))

    def getNextPixel(self,p,x,y):
        np=[]
        c=self.getWeight(p,x,y)
        for i,v in enumerate(p):
            nv=(v*self.scale[i]+self.offset[i])*c+(1-c)*v
            if nv>self.maxValue[self.bands[i]]:
                nv=self.maxValue[self.bands[i]]
            if nv<self.minValue[self.bands[i]]:
                nv=self.minValue[self.bands[i]]
            np.append(int(nv))
        return tuple(np)

    def getWeight(self,p,x,y):
        d=self.getDistanceFromCenter(x,y)
        c=exp(-.5*pow(d/self.sigma,2))
        return float(c)

    def getDistanceFromCenter(self,x,y):
        return pow(pow(x-self.xc,2)+pow(y-self.yc,2),.5)

class SquareDistanceBasedModification(DistanceBasedModification):
    def getDescrip(self):
        return "Color the Image based on the minimum x or y distance from a single point"

    def getDistanceFromCenter(self,x,y):
        return max(pow(x-self.xc,2),pow(y-self.yc,2))

class ASCIIArt:
    def __init__(self):
        self.outFile="C:/Users/curram2/Pictures/PythonModified/"
        self.palette=""

    def getDescrip(self):
        return "Make An ASCII Art version of the picture"

    def getPalette(self):
        return '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`''. '

    def getBeginText(self):
        return "-----------------------ASCII Art-----------------------"

    def getEndText(self):
        return "---------------------End ASCII Art---------------------"

    def getCharacter(self,p):
        s=p[0]*.2989+p[1]*.5870+p[2]*.1140
        return self.palette[int(s/255*len(self.palette))]

    def execute(self,im):
        print self.getBeginText()
        self.palette=self.getPalette()
        s=""
        pix=im.load()
        for x in range(im.size[1]):
            for y in range(im.size[0]):
                s+=self.getCharacter(pix[y,x])
            s+="\n"
        self.saveASCIIArt(s,sn)
        print self.getEndText()

    def saveASCIIArt(self,s,sn):
        f=open(self.getSaveFilePath(sn),'w')
        f.write(s[:-1])
        f.close()

    def getSaveFilePath(self,sn):
        return self.outFile+sn+".txt"

class SaveImage:
    def __init(self):
        self.outFile="C:/Users/curram2/Pictures/"

    def getDescrip(self):
        return "Saves The Image"

    def execute(self,im):
        print self.getBeginText()
        fn=self.getFileName()
        im.save(self.outFile+fn)
        print self.getEndText()
        return im

    def getBeginText(self):
        return "----------------------Saving Image...----------------------"

    def getEndText(self):
        return "------------------------Image Saved------------------------"

    def getFileName(self):
        fn=inFun("What is the file path you would like to save the image to?\n")
        return fn

class PreviewImage:
    def getDescrip(self):
        return "Preview an an Image in the default viewer"

    def getBeginText(self):
        return "----------------------Preview Image----------------------"

    def getEndText(self):
        return "--------------------End Preview Image--------------------"

    def execute(self,im):
        print self.getBeginText()
        im.show()
        print self.getEndText()
        return im

class ImageModifier:
    def __init__(self):
        self.options=[PixelWiseModification(),BlackAndWhite(),PresetBlackAndWhite(),DistanceBasedModification(),SquareDistanceBasedModification(),SaveImage(),PreviewImage(),ImageFilter(),GaussianKernel(),RangeFilter(),InvertColors()]

    def getDescrip(self):
        return "Modify the Image to create a new Image"

    def getBeginText(self):
        return "----------------------Modify Image----------------------"

    def getEndText(self):
        return "--------------------End Modify Image--------------------"

    def getExplainText(self):
        return "Enter the number of the left of the desired option to use that option and anything else to quit"

    def getOptionDescriptions(self):
        s=""
        s+="Modify the Image using the following options\n"
        for i,o in enumerate(self.options):
            s+=str(i)+":\t "+o.getDescrip()+"\n"
        return s[:-1]

    def execute(self,im):
        print self.getBeginText()
        while True:
            print self.getOptionDescriptions()
            op=inFun(self.getExplainText()+"\n")
            # try:
            op=int(op)
            if op<0 or op>=len(self.options):
                break
            im=self.options[op].execute(im)
            # except Exception, e:
            #     break
        print self.getEndText()

class ImageFilter(PixelWiseModification):
    def __init__(self):
        self.pix=None
        self.maxx=0
        self.maxy=0
        self.bands=[]
        self.normalize=False
        self.loop=True
        self.matrix=None

    def getDescrip(self):
        return "Apply a matrix to every pixel of an Image"

    def getBeginText(self):
        return "------------------Filter Image------------------"

    def getEndText(self):
        return "----------------End Filter Image----------------"

    def getNextPixel(self,x,y):
        np=[]
        m=self.getMatrix(x,y)
        coord=self.computeCoordinates(m,x,y)
        weights=[]
        pixels=[]
        for i,row in enumerate(m):
            for j,v in enumerate(row):
                if self.validCoordinate(coord[i][j]):
                    weights.append(self.getWeight(v,x,y,coord[i][j]))
                    pixels.append(self.pix[coord[i][j]])
        n=sum(weights)
        if n==0:
            self.normalize=False
        if not self.normalize:
            n=1
        for i in range(len(self.pix[x,y])):
            s=sum([float(p[i])*weights[j]/n for j,p in enumerate(pixels)])
            np.append(int(s))
        return tuple(np)

    def getWeight(self,v,x,y,coordtuple):
        return v

    def computeCoordinates(self,m,x,y):
        xo=-.5*len(m)+.5
        yo=-.5*len(m[0])+.5
        coords=[[(int(i+xo+x),int(j+yo+y)) for j in range(len(m[i]))]for i in range(len(m))]
        if self.loop:
            for i,r in enumerate(coords):
                for j,xy in enumerate(r):
                    if not self.validCoordinate(xy):
                        coords[i][j]=self.replaceCoordinate(xy)
        return coords

    def replaceCoordinate(self,xy):
        newxy=[xy[0],xy[1]]
        while not self.validCoordinate(tuple(newxy)):
            if xy[0]<0:
                newxy[0]=self.maxx+xy[0]
            if xy[1]<0:
                newxy[1]=self.maxy+xy[1]
            if xy[0]>=self.maxx:
                newxy[0]=xy[0]-self.maxx
            if xy[1]>=self.maxx:
                newxy[1]=xy[1]-self.maxy
        return tuple(newxy)

    def getMatrix(self,x,y):
        return self.matrix

    def validCoordinate(self,c):
        return not(c[0]<0 or c[0]>=self.maxx or c[1]<0 or c[1]>=self.maxy)

    def getExplainInputText(self):
        return "Enter the matrix in as a 2 dimensional python list"

    def setConstants(self):
        t=inFun("matrix\n")
        try:
            self.matrix=eval(t)
        except Exception, e:
            return

    def execute(self,im):
        print self.getBeginText()
        imcopy=im.copy()
        self.bands=imcopy.getbands()
        print self.getExplainInputText()
        self.setConstants()
        self.pix=im.load()
        pixels=imcopy.load()
        self.maxx=im.size[0]
        self.maxy=im.size[1]
        for x in range(im.size[0]):
            for y in range(im.size[1]):
                pixels[x,y]=self.getNextPixel(x,y)
        print self.getEndText()
        return imcopy

class GaussianKernel(ImageFilter):
    def getDescrip(self):
        return "Apply a Gaussian Kernel to the Image"

    def getBeginText(self):
        return "------------------Guassian Kernel------------------"

    def getEndText(self):
        return "----------------End Guassian Kernel----------------" 
        
    def getExplainInputText(self):
        return "Enter the sigma value"

    def setConstants(self):
        self.normalize=True
        self.loop=False
        sigma=inFun("sigma\n")
        try:
            sigma=float(sigma)
        except Exception, e:
            return
        self.matrix=[[1/(2*pi*sigma*sigma)*exp(-(x*x+y*y)/(2*sigma*sigma))   for y in xrange(int(-3*sigma),int(3*sigma))] for x in xrange(int(-3*sigma),3*int(sigma))]

class RangeFilter(ImageFilter):
    def getDescrip(self):
        return "Applies a range filter to the Image"

    def getBeginText(self):
        return "------------------Range Filter------------------"

    def getBeginText(self):
        return "----------------End Range Filter----------------"

    def getExplainInputText(self):
        return "Enter the size of the Filter"

    def setConstants(self):
        self.loop=False
        self.normalize=True
        rows,cols=self.getConstants(("rows","cols"),(int,int))
        self.matrix=[[0 for i in range(cols)]for j in range(rows)]
        self.defaultvalue=1

    def getWeight(self,v,x,y,coordtuple):
        pix1=self.pix[x,y]
        pix2=self.pix[coordtuple]
        d=self.computeDistance(pix1,pix2)
        if d==0:
            return self.defaultvalue
        else:
            return d

    def computeDistance(self,p1,p2):
        s=0.0
        for i in range(len(p1)):
            s+=pow(float(p1[i])-float(p2[i]),2)
        return pow(s,.5)

class InvertColors(PixelWiseModification):
    def getNextPixel(self,p,x,y):
        np=[]
        for v in p:
            np.append(255-v)
        return tuple(np)

    def setConstants(self):
        pass

    def getDescrip(self):
        return "Inver the colors of the Image"

    def getBeginText(self):
        return "------------------Invert Colors------------------"

    def getExplainInputText(self):
        return ""  

    def getEndText(self):
        return "----------------End Invert Colors----------------"



interactiveRun()
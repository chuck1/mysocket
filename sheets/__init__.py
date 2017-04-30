

import numpy



class Cell(object):
    def __init__(self,r,c):
        self.string = None
        self.r = r
        self.c = c

    def set_string(self,s):
        if s == self.string: return
        self.string = s
        self.comp()
        self.calc()
        
    def comp(self):
        self.code = compile(
                self.string,
                "<cell {},{}>".format(self.r,self.c),
                'eval')

    def get_globals(self):
        return {'__builtins__':{}}

    def calc(self):
        self.value = eval(self.code,self.get_globals())


class Sheet(object):
    def __init__(self):
        self.cells = numpy.empty((0,0),dtype=object)
    def set_cell(self,r,c,s):
        if r > (numpy.shape(self.cells)[0]-1):
            shape = (r-numpy.shape(self.cells)[0]+1,numpy.shape(self.cells)[1])
            self.cells = numpy.append(
                    self.cells,
                    numpy.empty(shape,dtype=object),
                    axis=0)

        if c > (numpy.shape(self.cells)[1]-1):
            shape = (numpy.shape(self.cells)[0],c-numpy.shape(self.cells)[1]+1)
            self.cells = numpy.append(
                    self.cells,
                    numpy.empty(shape,dtype=object),
                    axis=1)

        if self.cells[r,c] is None:
            self.cells[r,c] = Cell(r,c)

        self.cells[r,c].set_string(s)


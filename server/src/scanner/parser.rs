pub struct Parser {
    data: Vec<u8>,
    position: usize,
}

pub struct ParserData {
    pub tag: u8,
    pub data: Vec<u8>,
}

impl Parser {
    pub fn new(data: Vec<u8>) -> Self {
        Parser { data, position: 0 }
    }
}

impl Iterator for Parser {
    type Item = ParserData;

    fn next(&mut self) -> Option<Self::Item> {
        // Get length from data
        if let Some(length) = self.data.get(self.position) {
            // Get tag from data
            if *length <= 1 || self.position + (*length as usize) >= self.data.len() {
                return None;
            }

            // If the array size is OK, return the chunk
            let result = ParserData {
                tag: self.data[self.position + 1],
                data: self.data[self.position + 2..self.position + 1 + (*length as usize)].to_vec(),
            };

            self.position += *length as usize + 1;
            return Some(result);
        }
        return None;
    }
}

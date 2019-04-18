package cobol;

import parse.Assembler;
import parse.Assembly;
import parse.tokens.Token;

public class ExternalCallAssembler extends Assembler {

	@Override
	public void workOn(Assembly a) {
		Cobol c = new Cobol();
		System.out.println(a.toString());
		Token usingRef = (Token) a.pop();
		c.setCallUsing(usingRef.sval());
		a.pop(); //using
		Token ref = (Token) a.pop();
		c.setCallref(ref.sval());
		a.setTarget(c);
	}

}
